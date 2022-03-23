import * as Joi from "joi";
import { createJoinQueryBuilder } from "safe-typeorm";

import * as dto from "../dto";
import * as entity from "../entity";
import { PayloadError } from "../error";
import { getLogger } from "../logger";
import { getConnection } from "typeorm";
import { bookKind, bookSortBy } from "./payload";
import { isNullOrUndefined } from "../type/guard";

const log = getLogger("usecase/getBooks");

const payload = Joi.object({
    perPage: Joi.number().min(1).max(100).required(),
    page: Joi.number().min(1).required(),
    kind: Joi.valid(...bookKind("kebab")),
    sortBy: Joi.valid(...bookSortBy("kebab")).required(),
});

export type Payload = {
    perPage?: number;
    page?: number;
    sortBy?: dto.BookSortBy.BookSortBy | null;
    kind?: dto.BookKind.BookKind | null;
};

export const toPayload = ({
    perPage,
    page,
    sortBy,
    kind,
}: {
    [key: string]: string | undefined;
}): Payload => ({
    perPage: perPage ? parseInt(perPage, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
    sortBy: sortBy ? dto.BookSortBy.fromKebabCase(sortBy) : undefined,
    kind: kind ? dto.BookKind.fromKebabCase(kind) : undefined,
});

export const execute = async ({
    perPage = 25,
    page = 1,
    sortBy = dto.BookSortBy.BookSortBy.IdDesc,
    kind,
}: Payload): Promise<dto.Book.Book[]> => {
    const validate = payload.validate({
        kind: dto.BookKind.toKebabCase(kind), // 없어도 되는 파라미터는 이렇게
        sortBy: dto.BookSortBy.toKebabCase(sortBy) || "", // 있어야되는 파라미터는 이렇게. 친절한 에러메세지를 보고 싶으면 `|| ""`를 해줘야함
        perPage,
        page,
    });

    log.debug(validate.value);

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    if (isNullOrUndefined(sortBy)) {
        throw "unreachable";
    }

    // TODO: Remove
    if (dto.BookSortBy.isRandom(sortBy)) {
        const query = `
            SELECT
                books.id AS a_id,
                books.title AS a_title,
                books.kind AS a_kind,
                books.page AS a_page,
                books.language AS a_language,
                books.created_at AS a_created_at,
                books.updated_at AS a_updated_at,
                book_tags.id AS b_id,
                book_tags.kind AS b_kind,
                book_tags.name AS b_name
            FROM
                (
                    SELECT
                        *
                    FROM
                        books
                    ${kind ? `WHERE books.kind = $3` : ""}
                    ORDER BY
                        RANDOM()
                    OFFSET
                        $1
                    LIMIT
                        $2
                ) as books
            LEFT JOIN book_tag_ref
                ON book_tag_ref.book_id = books.id
            LEFT JOIN book_tags
                ON book_tags.id = book_tag_ref.book_tag_id
        `;

        const params: unknown[] = [perPage * (page - 1), perPage];

        if (kind) {
            params.push(dto.BookKind.toSnakeCase(kind));
        }

        const rows: unknown[] = await getConnection().query(
            query,
            params,
        );

        return dto.Book.fromRows(rows);
    }

    const query = createJoinQueryBuilder(entity.Book, (book) => {
        book.leftJoinAndSelect("tags", (tag) =>
            tag.leftJoinAndSelect("tag"),
        );
    })
        .select()
        .orderBy(
            dto.BookSortBy.toSort(sortBy, "Book"),
            dto.BookSortBy.toOrder(sortBy),
        )
        .skip(perPage * (page - 1))
        .take(perPage);

    if (!isNullOrUndefined(kind)) {
        query.where("Book.kind = :kind", {
            kind: dto.BookKind.toSnakeCase(kind),
        });
    }

    const books = await query.getMany();

    return Promise.all(books.map(dto.Book.fromEntity));
};
