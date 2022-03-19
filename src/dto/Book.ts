import type { MergeObject } from "nodekell";

import * as entity from "../entity";
import * as dto from ".";

export type Book = {
    id: number;
    title: string;
    language: string;
    page: number;
    kind: dto.BookKind.BookKind;
    tags: dto.BookTag.BookTag[];
    created_at: Date;
    updated_at: Date;
};

export const fromEntity = async ({
    id,
    title,
    language,
    page,
    kind,
    tags,
    created_at,
    updated_at,
}: entity.Book): Promise<Book> => ({
    id,
    title,
    language,
    page,
    kind: dto.BookKind.fromEntity(kind),
    tags: await Promise.all(
        (await tags.get()).map(dto.BookTag.fromEntity),
    ),
    created_at,
    updated_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fromRows = (rows: any[]): Book[] => {
    const books: [
        Omit<entity.Book, "tags">,
        Omit<entity.BookTag, "ref">[],
    ][] = [];

    for (const row of rows) {
        const book: Omit<entity.Book, "tags"> = {
            id: row.a_id,
            title: row.a_title,
            kind: row.a_kind,
            page: row.a_page,
            language: row.a_language,
            created_at: row.a_created_at,
            updated_at: row.a_updated_at,
        };

        const book_tag: MergeObject<
            Omit<entity.BookTag, "ref">,
            [{ book_id: number }]
        > = {
            id: row.b_id,
            kind: row.b_kind,
            name: row.b_name,
            book_id: row.b_book_id,
        };

        if (books.length === 0) {
            books.push([book, [book_tag]]);
            continue;
        }

        const [left, right] = books[books.length - 1];

        if (left.id === book.id) {
            right.push(book_tag);
        } else {
            books.push([book, [book_tag]]);
        }
    }

    return books.map(([book, tags]) => ({
        ...book,
        kind: dto.BookKind.fromEntity(book.kind),
        tags: tags.map((x) => ({ kind: x.kind, name: x.name })),
    }));
};
