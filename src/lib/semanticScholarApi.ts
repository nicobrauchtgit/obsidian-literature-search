import { type SearchQuery, buildSearchParams } from "./searchQuery";
import mockResponse from "./__mocks__/semanticScholarGraphSearchResponse.json";
import { requestUrl, type RequestUrlParam } from "obsidian";

const baseUrl = "https://api.semanticscholar.org/graph/v1";

export interface Author {
	authorId: string;
	name: string;
}

export interface OpenAccessPdf {
	url: string;
	status?: string | null;
	license?: string | null;
}

export interface S2FieldOfStudy {
	category: string;
	source: string;
}

export interface Tldr {
	model: string;
	text: string;
}

export interface Journal {
	name?: string;
	volume?: string;
	pages?: string;
}

export interface PublicationVenue {
	id: string;
	name: string;
	type?: string;
	url?: string;
}

export interface ExternalIds {
	DOI?: string;
	ArXiv?: string;
	PubMed?: string;
	CorpusId?: number;
	[key: string]: string | number | undefined;
}

export interface Paper {
	paperId: string;
	corpusId?: number;
	externalIds?: ExternalIds;
	url?: string;
	title: string;
	abstract?: string | null;
	venue?: string;
	publicationVenue?: PublicationVenue | null;
	year?: number;
	referenceCount?: number;
	citationCount?: number;
	influentialCitationCount?: number;
	isOpenAccess?: boolean;
	openAccessPdf?: OpenAccessPdf | null;
	fieldsOfStudy?: string[] | null;
	s2FieldsOfStudy?: S2FieldOfStudy[];
	publicationTypes?: string[] | null;
	publicationDate?: string | null;
	journal?: Journal | null;
	authors?: Author[];
	citations?: Paper[];
	references?: Paper[];
	tldr?: Tldr | null;
	citationStyles?: { bibtex?: string } | null;
	embedding?: { model: string; vector: number[] } | null;
}

export interface SearchPapersResponse {
	total: number;
	offset: number;
	next?: number;
	data: Paper[];
}

export const paperFields = [
	"paperId",
	"corpusId",
	"externalIds",
	"url",
	"title",
	"abstract",
	"venue",
	"publicationVenue",
	"year",
	"referenceCount",
	"citationCount",
	"influentialCitationCount",
	"isOpenAccess",
	"openAccessPdf",
	"fieldsOfStudy",
	"s2FieldsOfStudy",
	"publicationTypes",
	"publicationDate",
	"journal",
	"authors",
	"citations",
	"references",
	"tldr",
	"citationStyles",
	"embedding",
] as const;

export type PaperField = (typeof paperFields)[number];

const defaultFields: PaperField[] = [
	"url",
	"title",
	"year",
	"authors",
	"tldr",
	"citationCount",
	"s2FieldsOfStudy",
	"openAccessPdf",
];

export const searchPapers = async (
	query: SearchQuery,
	apiKey?: string,
	fields?: PaperField[],
): Promise<SearchPapersResponse> => {
	const resolvedFields = (fields ?? defaultFields).join(",");
	const queryWithFields: SearchQuery = {
		...query,
		fields: resolvedFields,
	};
	const params = buildSearchParams(queryWithFields);
	console.log(params);
	const useMock = false; // Toggle to false to use real API
	if (useMock) {
		return mockResponse as unknown as SearchPapersResponse;
	}

	const requestUrlParam: RequestUrlParam = {
		url: `${baseUrl}/paper/search?${params.toString()}`,
		method: "GET",
		headers: apiKey ? { "x-api-key": apiKey } : undefined,
	};
	const res = await requestUrl(requestUrlParam);

	console.log(res.json);

	return res.json as SearchPapersResponse;
};

const detailFields: PaperField[] = [
	"paperId",
	"corpusId",
	"externalIds",
	"url",
	"title",
	"abstract",
	"publicationVenue",
	"year",
	"referenceCount",
	"citationCount",
	"influentialCitationCount",
	"isOpenAccess",
	"openAccessPdf",
	"fieldsOfStudy",
	"s2FieldsOfStudy",
	"publicationTypes",
	"publicationDate",
	"journal",
	"authors",
	"tldr",
	"citationStyles",
];

const relatedPaperFields = [
	"paperId",
	"title",
	"year",
	"authors",
	"abstract",
	"url",
	"openAccessPdf",
	"externalIds",
	"citationCount",
	"influentialCitationCount",
	"isInfluential",
].join(",");

export interface CitationEntry {
	isInfluential: boolean;
	citingPaper: Paper;
}

export interface ReferenceEntry {
	isInfluential: boolean;
	citedPaper: Paper;
}

interface PaginatedResponse<T> {
	offset: number;
	next?: number;
	data: T[];
}

export interface PaperWithRelations {
	paper: Paper;
	citations: CitationEntry[];
	references: ReferenceEntry[];
}

export const getPaperDetails = async (
	paperId: string,
	apiKey?: string,
): Promise<Paper> => {
	const headers = apiKey ? { "x-api-key": apiKey } : undefined;
	const fields = detailFields.join(",");
	const res = await requestUrl({
		url: `${baseUrl}/paper/${paperId}?fields=${fields}`,
		method: "GET",
		headers,
	});
	return res.json as Paper;
};

export const getPaperCitations = async (
	paperId: string,
	apiKey?: string,
): Promise<CitationEntry[]> => {
	const headers = apiKey ? { "x-api-key": apiKey } : undefined;
	const res = await requestUrl({
		url: `${baseUrl}/paper/${paperId}/citations?fields=${relatedPaperFields}&limit=1000`,
		method: "GET",
		headers,
	});
	const data = res.json as PaginatedResponse<CitationEntry>;
	return data.data;
};

export const getPaperReferences = async (
	paperId: string,
	apiKey?: string,
): Promise<ReferenceEntry[]> => {
	const headers = apiKey ? { "x-api-key": apiKey } : undefined;
	const res = await requestUrl({
		url: `${baseUrl}/paper/${paperId}/references?fields=${relatedPaperFields}&limit=1000`,
		method: "GET",
		headers,
	});
	const data = res.json as PaginatedResponse<ReferenceEntry>;
	return data.data;
};

export const getPaperById = async (
	paperId: string,
	apiKey?: string,
): Promise<PaperWithRelations> => {
	const [paper, citations, references] = await Promise.all([
		getPaperDetails(paperId, apiKey),
		getPaperCitations(paperId, apiKey),
		getPaperReferences(paperId, apiKey),
	]);

	return { paper, citations, references };
};
