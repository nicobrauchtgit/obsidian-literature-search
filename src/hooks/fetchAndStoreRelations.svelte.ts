import { Notice } from "obsidian";
import type LiteratureSearchPlugin from "../main";
import {
	getPaperCitations,
	getPaperReferences,
	type Paper,
	type CitationEntry,
	type ReferenceEntry,
} from "../lib/semanticScholarApi";
import type { StoredPaper, PaperEdge, LiteratureDB } from "../lib/db";

function resolveApiKey(plugin: LiteratureSearchPlugin): string | undefined {
	const keyName = plugin.settings.apiKey;
	if (!keyName) return undefined;
	return plugin.app.secretStorage.getSecret(keyName) ?? undefined;
}

/**
 * Fetches citations and references for a paper and stores them in Dexie.
 */
export async function fetchAndStoreRelations(
	plugin: LiteratureSearchPlugin,
	paperId: string,
): Promise<{ citations: CitationEntry[]; references: ReferenceEntry[] }> {
	const apiKey = resolveApiKey(plugin);

	const [citations, references] = await Promise.all([
		getPaperCitations(paperId, apiKey),
		getPaperReferences(paperId, apiKey),
	]);

	await storeRelations(plugin, paperId, citations, references);

	return { citations, references };
}

/**
 * Converts an API Paper to a StoredPaper. Returns null if required fields
 * (url, authors, citationCount, influentialCitationCount) are missing.
 */
function paperToStoredPaper(paper: Paper): StoredPaper | null {
	if (
		!paper.url ||
		!paper.authors?.length ||
		paper.citationCount == null ||
		paper.influentialCitationCount == null
	) {
		new Notice(`Skipping paper "${paper.title}" — missing required fields`);
		return null;
	}

	return {
		paperId: paper.paperId,
		title: paper.title,
		year: paper.year,
		authors: paper.authors.map((a) => a.name),
		abstract: paper.abstract ?? null,
		tldr: paper.tldr?.text ?? null,
		url: paper.url,
		openAccessPdf: paper.openAccessPdf?.url ?? null,
		doi: paper.externalIds?.DOI
			? `https://doi.org/${paper.externalIds.DOI}`
			: null,
		arxivId: paper.externalIds?.ArXiv ?? null,
		citationCount: paper.citationCount,
		influentialCitationCount: paper.influentialCitationCount,
	};
}

/**
 * Counts the number of non-null, non-undefined properties on a StoredPaper.
 * Arrays count as filled if they have at least one element.
 */
function infoDensity(paper: StoredPaper): number {
	let count = 0;
	for (const [key, value] of Object.entries(paper)) {
		if (key === "paperId") continue;
		if (key === "influentialFor") continue; // managed separately
		if (value == null) continue;
		if (Array.isArray(value) && value.length === 0) continue;
		if (value === "") continue;
		count++;
	}
	return count;
}

/**
 * Stores a paper only if it doesn't already exist or if the new version
 * has more populated fields (higher information density).
 */
async function upsertPaperIfRicher(
	db: LiteratureDB,
	paper: StoredPaper,
): Promise<void> {
	const existing = await db.papers.get(paper.paperId);
	if (!existing) {
		await db.papers.put(paper);
		return;
	}
	if (infoDensity(paper) > infoDensity(existing)) {
		// Preserve existing influentialFor when overwriting
		paper.influentialFor = existing.influentialFor;
		await db.papers.put(paper);
	}
}

/**
 * Appends a sourcePaperId to a paper's influentialFor list if not already present.
 */
async function appendInfluentialFor(
	db: LiteratureDB,
	paperId: string,
	sourcePaperId: string,
): Promise<void> {
	const paper = await db.papers.get(paperId);
	if (!paper) return;

	const list = paper.influentialFor ?? [];
	if (list.includes(sourcePaperId)) return;

	paper.influentialFor = [...list, sourcePaperId];
	await db.papers.put(paper);
}

/**
 * Adds edges that don't already exist (by sourcePaperId + targetPaperId + type).
 */
async function addNewEdges(
	db: LiteratureDB,
	edges: PaperEdge[],
): Promise<void> {
	if (edges.length === 0) return;

	const type = edges[0].type;
	const sourcePaperId = edges[0].sourcePaperId;

	const existingEdges = await db.edges.where({ sourcePaperId, type }).toArray();
	const existingTargets = new Set(existingEdges.map((e) => e.targetPaperId));
	const newEdges = edges.filter((e) => !existingTargets.has(e.targetPaperId));

	if (newEdges.length > 0) {
		await db.edges.bulkAdd(newEdges);
	}
}

async function storeRelations(
	plugin: LiteratureSearchPlugin,
	sourcePaperId: string,
	citations: CitationEntry[],
	references: ReferenceEntry[],
): Promise<void> {
	const { db } = plugin;

	// Store citations (papers that cite this paper)
	if (citations.length) {
		const validCitations = citations.filter(
			(c) => c.citingPaper.paperId != null,
		);

		const storedCitations: { paper: StoredPaper; edge: PaperEdge }[] = [];
		for (const entry of validCitations) {
			const stored = paperToStoredPaper(entry.citingPaper);
			if (!stored) continue;
			storedCitations.push({
				paper: stored,
				edge: {
					sourcePaperId,
					targetPaperId: entry.citingPaper.paperId,
					type: "citation" as const,
					isInfluential: entry.isInfluential,
				},
			});
		}

		for (const { paper: citedPaper } of storedCitations) {
			await upsertPaperIfRicher(db, citedPaper);
		}

		for (const entry of validCitations) {
			if (entry.isInfluential) {
				await appendInfluentialFor(
					db,
					entry.citingPaper.paperId,
					sourcePaperId,
				);
			}
		}

		await addNewEdges(
			db,
			storedCitations.map((s) => s.edge),
		);
	}

	// Store references (papers this paper cites)
	if (references.length) {
		const validReferences = references.filter(
			(r) => r.citedPaper.paperId != null,
		);

		const storedReferences: { paper: StoredPaper; edge: PaperEdge }[] = [];
		for (const entry of validReferences) {
			const stored = paperToStoredPaper(entry.citedPaper);
			if (!stored) continue;
			storedReferences.push({
				paper: stored,
				edge: {
					sourcePaperId,
					targetPaperId: entry.citedPaper.paperId,
					type: "reference" as const,
					isInfluential: entry.isInfluential,
				},
			});
		}

		for (const { paper: refPaper } of storedReferences) {
			await upsertPaperIfRicher(db, refPaper);
		}

		for (const entry of validReferences) {
			if (entry.isInfluential) {
				await appendInfluentialFor(db, entry.citedPaper.paperId, sourcePaperId);
			}
		}

		await addNewEdges(
			db,
			storedReferences.map((s) => s.edge),
		);
	}
}
