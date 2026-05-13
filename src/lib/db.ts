import Dexie, { type Table } from "dexie";

export interface StoredPaper {
	paperId: string;
	title: string;
	year: number;
	authors: string[];
	abstract?: string | null;
	tldr?: string | null;
	url: string;
	openAccessPdf?: string | null;
	doi?: string | null;
	arxivId?: string | null;
	citationCount: number;
	influentialCitationCount: number;
	bibtex?: string | null;
	influentialFor?: string[];
}

export interface PaperEdge {
	id?: number;
	sourcePaperId: string;
	targetPaperId: string;
	type: "citation" | "reference";
	isInfluential: boolean;
}

export class LiteratureDB extends Dexie {
	papers!: Table<StoredPaper, string>;
	edges!: Table<PaperEdge, number>;

	constructor() {
		super("LiteratureSearchDB");

		this.version(1).stores({
			papers: "paperId, title, year",
			edges: "++id, [sourcePaperId+type], sourcePaperId, targetPaperId",
		});
	}
}
