import { z } from "zod";

export const publicationTypes = [
	"Review",
	"JournalArticle",
	"CaseReport",
	"ClinicalTrial",
	"Conference",
	"Dataset",
	"Editorial",
	"LettersAndComments",
	"MetaAnalysis",
	"News",
	"Study",
	"Book",
	"BookSection",
] as const;

export const fieldsOfStudy = [
	"Computer Science",
	"Medicine",
	"Chemistry",
	"Biology",
	"Materials Science",
	"Physics",
	"Geology",
	"Psychology",
	"Art",
	"History",
	"Geography",
	"Sociology",
	"Business",
	"Political Science",
	"Economics",
	"Philosophy",
	"Mathematics",
	"Engineering",
	"Environmental Science",
	"Agricultural and Food Sciences",
	"Education",
	"Law",
	"Linguistics",
] as const;

export const SearchQuerySchema = z.object({
	query: z.string().min(3),
	fields: z.string().optional(),
	publicationTypes: z.array(z.enum(publicationTypes)).optional(),
	openAccessPdf: z.boolean().optional(),
	minCitationCount: z.number().min(0).optional(),
	publicationDateOrYear: z.string().optional(),
	year: z.string().optional(),
	venue: z.string().optional(),
	fieldsOfStudy: z.array(z.enum(fieldsOfStudy)).optional(),
	offset: z.number().min(0).default(0).optional(),
	limit: z.number().min(1).max(100).default(100).optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export function buildSearchParams(query: SearchQuery): URLSearchParams {
	const params = new URLSearchParams();

	params.set("query", query.query);

	if (query.fields != null) {
		params.set("fields", query.fields);
	}

	if (query.publicationTypes != null && query.publicationTypes.length > 0) {
		params.set("publicationTypes", query.publicationTypes.join(","));
	}

	if (query.openAccessPdf === true) {
		params.set("openAccessPdf", "");
	}

	if (query.minCitationCount != null) {
		params.set("minCitationCount", String(query.minCitationCount));
	}

	if (query.publicationDateOrYear != null) {
		params.set("publicationDateOrYear", query.publicationDateOrYear);
	}

	if (query.year != null) {
		params.set("year", query.year);
	}

	if (query.venue != null) {
		params.set("venue", query.venue);
	}

	if (query.fieldsOfStudy != null && query.fieldsOfStudy.length > 0) {
		params.set("fieldsOfStudy", query.fieldsOfStudy.join(","));
	}

	if (query.offset != null) {
		params.set("offset", String(query.offset));
	}

	if (query.limit != null) {
		params.set("limit", String(query.limit));
	}

	return params;
}
