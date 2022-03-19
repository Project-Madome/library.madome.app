import * as F from "nodekell";
import { DateTime } from "luxon";
import { getRepository, In } from "typeorm";

import * as entity from "../../entity";
import * as model from "../../model";

const toName = ({ name }: { name: string }) => name;
const toMany = (e: string) => {
    switch (e) {
        case "artist":
            return "artists";
        case "character":
            return "characters";
        case "tag":
            return "tags";
        default:
            return e;
    }
};

/* export function getBookInfo(book: Book | Book[]) {
    try {
        if (Array.isArray(book)) {
            return _getBooksInfo(book);
        }
        return _getBookInfo(book);
    } catch (error) {
        throw error;
    }
} */

export const getBooksInfo = async (books: entity.Book[]) => {
    const metadataRepo = getRepository(entity.BookTag);

    const book_ids = books.map((book) => book.id);

    const metadata =
        book_ids.length > 0
            ? await metadataRepo.find({
                  where: { fk_book_id: In(book_ids) },
              })
            : [];

    const metadataByID = await F.run(
        metadata,
        F.groupBy((e) => e.fk_book_id),
        // prettier-ignore
        F.forEach(async ([id, m]) => [id, await convertMetadata(m)] as [number, F.EP<ReturnType<typeof convertMetadata>>]),
        (e) => new Map(e),
    );

    return F.forEach(
        async (book) => ({
            ...book,
            ...metadataByID.get(book.id)!,
            created_at: DateTime.fromJSDate(book.created_at).toISO(),
        }),
        books,
    ) as Promise<model.Book[]>;
};

export const getBookInfo = async (book: entity.Book) => {
    const metadataRepo = getRepository(entity.BookTag);

    const metadata = await metadataRepo.find({
        where: { fk_book_id: book.id },
    });

    const metadataByType = await convertMetadata(metadata);

    return {
        ...book,
        ...metadataByType,
        created_at: DateTime.fromJSDate(book.created_at).toISO(),
    } as model.Book;
};

export const convertMetadata = F.pipe(
    F.groupBy((e: entity.BookTag) => toMany(e.kind)),
    F.map(([type, values]) => ({ [type]: values.map(toName) })),
    F.foldl((acc, elem) => ({ ...acc, ...elem }), {}),
);
