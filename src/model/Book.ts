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
    page: number;
    tags: model.BookTag.BookTag[];
    created_at: string; // Date
    updated_at: string;
};

export const fromDto = ({
    id,
    title,
    kind,
    language,
    page,
    tags,
    created_at,
    updated_at,
}: dto.Book.Book): Book => ({
    id,
    title,
    kind: model.BookKind.from(kind),
    language,
    page,
    tags, // : tags.map(model.BookTag.from),
    created_at: created_at.toISOString(),
    updated_at: updated_at.toISOString(),
});
