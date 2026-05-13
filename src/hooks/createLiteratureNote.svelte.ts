import { normalizePath, Notice } from "obsidian";
import type LiteratureSearchPlugin from "../main";
import { getPaperDetails, type Paper } from "../lib/semanticScholarApi";
import type { StoredPaper } from "../lib/db";

function resolveApiKey(plugin: LiteratureSearchPlugin): string | undefined {
	const keyName = plugin.settings.apiKey;
	if (!keyName) return undefined;
	return plugin.app.secretStorage.getSecret(keyName) ?? undefined;
}

export async function createLiteratureNote(
	plugin: LiteratureSearchPlugin,
	paperId: string,
): Promise<void> {
	if (!plugin.settings.literatureNotePath) {
		new Notice("Literature note directory not set");
		throw new Error("Literature note directory not set");
	}

	const apiKey = resolveApiKey(plugin);
	const paper = await getPaperDetails(paperId, apiKey);

	// Store the main paper in Dexie
	const storedPaper = paperToStoredPaper(paper);
	if (storedPaper) {
		await plugin.db.papers.put(storedPaper);
	}

	const fileName = `${paper.title.replace(/[\/\[\]:]/g, "")}.md`;
	const path = normalizePath(
		`${plugin.settings.literatureNotePath}/${fileName}`,
	);

	const content = buildNoteContent(paper);
	const literatureNote = await plugin.app.vault.create(path, content);
	plugin.addVaultPaperId(paperId);
	new Notice(`Created note: ${fileName}`);
	const leaf = plugin.app.workspace.getLeaf(true);
	await leaf.openFile(literatureNote);
}

function paperToStoredPaper(paper: Paper): StoredPaper | null {
	if (
		!paper.url ||
		!paper.authors?.length ||
		paper.citationCount == null ||
		paper.influentialCitationCount == null
	) {
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
		bibtex: paper.citationStyles?.bibtex ?? null,
	};
}

function buildNoteContent(paper: Paper): string {
	const lines: string[] = [];

	// Frontmatter
	lines.push("---");
	lines.push(`paperId: "${paper.paperId}"`);
	if (paper.title) lines.push(`title: "${paper.title}"`);
	if (paper.year) lines.push(`year: ${paper.year}`);
	if (paper.publicationDate) lines.push(`date: ${paper.publicationDate}`);
	if (paper.externalIds?.DOI)
		lines.push(`doi: "https://doi.org/${paper.externalIds.DOI}"`);

	if (paper.fieldsOfStudy?.length) {
		lines.push(`fieldsOfStudy:`);
		for (const field of paper.fieldsOfStudy) {
			lines.push(`  - "${field}"`);
		}
	}
	if (paper.authors?.length) {
		lines.push(`authors:`);
		for (const author of paper.authors) {
			lines.push(`  - "${author.name}"`);
		}
	}
	if (paper.url) lines.push(`url: "${paper.url}"`);
	if (paper.openAccessPdf?.url) lines.push(`pdf: "${paper.openAccessPdf.url}"`);
	lines.push("---");
	lines.push("");

	// TLDR
	if (paper.tldr?.text) {
		lines.push(`## TL;DR`);
		lines.push(paper.tldr.text);
		lines.push("");
	}

	// Abstract
	if (paper.abstract) {
		lines.push(`## Abstract`);
		lines.push(paper.abstract);
		lines.push("");
	}

	return lines.join("\n");
}
