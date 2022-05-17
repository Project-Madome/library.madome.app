import * as Joi from "joi";
import { getConnection } from "typeorm";

import * as entity from "../entity";
import * as dto from "../dto";
import * as usecase from "../usecase";
import { PayloadError } from "../error";
import { getLogger } from "../logger";
import { isNullOrUndefined } from "../type/guard";
import { bookSortBy } from "./payload";

const log = getLogger("usecase/searchBooks");

export const isToken = (st: string) =>
    st === "OR" ||
    st === "AND" ||
    st === "NOT" ||
    st === "|" ||
    st === "&" ||
    st === "!"; // /(OR|AND|NOT|\||&|!)/.test(st);

const replaceToken = (x: string) =>
    x
        .replaceAll("OR", "|")
        .replaceAll("AND", "&")
        .replaceAll("NOT", "!");

const parseSearchQuery = (str: string) =>
    str
        .split(" ")
        .map((e, i, a) => {
            const nextStr = a.at(i + 1);

            // prettier-ignore
            const tokenReplaced = replaceToken(e);

            if (/^(\||&|!)$/.test(tokenReplaced)) {
                return tokenReplaced;
            }

            if (tokenReplaced.endsWith(")")) {
                return tokenReplaced.replace(/\)$/, ":*)");
            }

            if (!isToken(nextStr || "")) {
                const space = "+";
                return `${tokenReplaced}${nextStr ? space : ":*"}`;
            }

            return `${tokenReplaced}:*`;

            /* return /(\||&|!)/.test(tokenReplaced)
                ? tokenReplaced
                : tokenReplaced.endsWith(')')
                ? tokenReplaced.replace(/\)$/, ':*)')
                : `${tokenReplaced}:*`; */
        })
        .join("");
// .toLowerCase();

// console.log(searchQueryParser('female anal AND female s d'));

const payload = Joi.object({
    query: Joi.string().min(1).required(),
    searchKind: Joi.string().valid("title", "tag").required(),
    bookKind: Joi.string().allow(""),
    sortBy: Joi.string()
        .valid(...bookSortBy("kebab"))
        .required(),
    perPage: Joi.number().min(1).max(100).required(),
    page: Joi.number().min(1).required(),
});

export type Payload = {
    query: string;
    searchKind: string;
    bookKind?: dto.BookKind.BookKind | null;
    sortBy?: dto.BookSortBy.BookSortBy | null;
    perPage?: number;
    page?: number;
};

export const toPayload = ({
    query,
    searchKind,
    bookKind,
    sortBy,
    perPage,
    page,
}: {
    [key: string]: string | undefined;
}): Payload => ({
    query: parseSearchQuery(query?.trim() || ""),
    searchKind: searchKind || "",
    bookKind: bookKind
        ? dto.BookKind.fromKebabCase(bookKind)
        : undefined,
    sortBy: sortBy ? dto.BookSortBy.fromKebabCase(sortBy) : undefined,
    perPage: perPage ? parseInt(perPage, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
});

export const execute = async ({
    query,
    searchKind,
    bookKind,
    sortBy = dto.BookSortBy.BookSortBy.RankDesc,
    perPage = 25,
    page = 1,
}: Payload): Promise<dto.Book.Book[]> => {
    const validate = payload.validate({
        query,
        searchKind,
        bookKind: dto.BookKind.toKebabCase(bookKind),
        sortBy: dto.BookSortBy.toKebabCase(sortBy) || "",
        perPage,
        page,
    });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    if (isNullOrUndefined(sortBy)) {
        throw "unreachable";
    }

    /* try {
        await getConnection().query(
            `SELECT to_tsquery($$${query}$$);`,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        
    } */

    const sql = getConnection()
        .createQueryBuilder(entity.BookTsvector, "book_tsvector")
        .select("id")
        .addSelect(
            `ts_rank(${searchKind}_tsv, to_tsquery($1))`,
            "rank",
        )
        .where(`${searchKind}_tsv @@ to_tsquery($1)`)
        .orderBy(
            dto.BookSortBy.toSort(sortBy),
            dto.BookSortBy.toOrder(sortBy),
        )
        .skip(perPage * (page - 1))
        .take(perPage)
        .getQuery();

    // log.debug(sql);

    const res: { id: number; rank: number }[] = await getConnection()
        .query(sql, [query])
        .catch((error) => {
            log.error(error);

            if (error.code === "42601") {
                throw new PayloadError("Invalid search query");
            }
            throw error;
        });

    log.debug(res);

    const books =
        res.length > 0
            ? await usecase.getBooksByIds.execute(
                  res.map((x) => x.id),
              )
            : [];

    if (!isNullOrUndefined(bookKind)) {
        return books.filter((x) => x.kind === bookKind);
    }

    return books;
};
