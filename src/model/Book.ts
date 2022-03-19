import * as dto from "../dto";
import * as model from "../model";

export type Book = {
    id: number;
    title: string;
    /* group: string[];
    characters: string[];
    artists: string[];
    series: string[]; */
    kind: string;
    language: string;
    tags: model.BookTag.BookTag[];
    page: number;
    created_at: string; // Date
    updated_at: string;
};

export const fromDto = ({
    id,
    title,
    kind,
    language,
    tags,
    page,
    created_at,
    updated_at,
}: dto.Book.Book): Book => ({
    id,
    title,
    kind: model.BookKind.from(kind),
    language,
    tags, // : tags.map(model.BookTag.from),
    page,
    created_at: created_at.toISOString(),
    updated_at: updated_at.toISOString(),
});
