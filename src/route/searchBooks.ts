import * as Joi from "joi";
import * as F from "nodekell";
import * as R from "ramda";
import { In, getConnection, getRepository } from "typeorm";

import Book from "../entity/Book";
import { getBooksInfo } from "./lib/getBookInfo";
import { router } from ".";
import { parseSortQuery } from "../lib/parseSortQuery";
import { syncIndexBy } from "../lib/syncIndexBy";

export const isToken = (st: string) => /(OR|AND|NOT|\||&|!)/.test(st);
export const replaceToken = R.pipe(
    R.replace(/OR/g, "|"),
    R.replace(/AND/g, "&"),
    R.replace(/NOT/g, "!"),
);

export const searchQueryParser = (str: string) =>
    str
        .split(" ")
        .map((e, i, a) => {
            const nextStr = a[i + 1] as string | undefined;

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

// console.log(searchQueryParser('female anal AND female s d'));

const searchBooksRequestSchema = Joi.object({
    q: Joi.string().min(1).required(),
    search_type: Joi.string()
        .valid("group", "character", "title", "artist", "series", "tag")
        .required(),
    book_type: Joi.string().allow(""),
    sort: Joi.object({
        by: Joi.string().valid("rank", "created_at", "title", "page_count").required(),
        method: Joi.string().valid("DESC", "ASC").required(),
    }).required(),
    offset: Joi.number().min(1).required(),
    page: Joi.number().min(1).required(),
});

export const searchBooks = router.get("/v1/books/search", async (ctx) => {
    const {
        q: _q = "",
        "search-type": search_type = "",
        "book-type": book_type,
        offset = "25",
        page = "1",
        sort: _sort = "created_desc",
    } = ctx.request.query as any;

    /* const {
        q: _q = '',
        search_type = '',
        book_type,
        offset = 25,
        page = 1,
        sort: _sort = 'created_desc', // rank_asc | created_desc | created_asc
    }: ParseRequestType<ILibraryMethods['searchBooks']> = ctx.req; */

    const q = _q.trim();

    const sort = parseSortQuery(_sort);

    const validate = searchBooksRequestSchema.validate({
        q,
        search_type,
        book_type,
        offset,
        page,
        sort,
    });

    if (validate.error) {
        const err = { code: 400, error: "INVALID_ARGUMENT" };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    const bookRepo = getRepository(Book);

    const query = searchQueryParser(q).toLowerCase();

    try {
        await getConnection().query(`SELECT to_tsquery($$${query}$$);`);
    } catch (error: any) {
        const err = {
            code: 400,
            message: error.message || "INVALID_ARGUMENT",
        };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    const sort_is_not_rank = sort.by !== "rank";

    // prettier-ignore
    const sql = `SELECT id, ts_rank(${search_type}_tsv, to_tsquery($$${query}$$)) as rank
    FROM book_tsv
    WHERE ${search_type}_tsv @@ to_tsquery($$${query}$$)
    ${book_type ? `AND type_tsv @@ to_tsquery($$${book_type}$$)` : ''}
    ${sort_is_not_rank ? '' : `ORDER BY ${sort.by} ${sort.method}`}
    ${sort_is_not_rank ? '' : `OFFSET ${(page - 1) * offset}`}
    ${sort_is_not_rank ? '' : `LIMIT ${offset}`}
    -- ORDER BY ts_rank ${sort_is_not_rank ? 'DESC' : sort.method}
    -- OFFSET ${(page - 1) * offset}
    -- LIMIT ${offset};`;

    const searchedResults: {
        id: number;
        ts_rank: number;
    }[] = await getConnection().query(sql);

    const ids = searchedResults.map((e) => e.id);

    if (ids.length === 0) {
        /* const res: ParseResponseType<ILibraryMethods['searchBooks']> = {
            books: [],
        }; */
        ctx.body = [];
        return;
    }

    const books = await F.run(
        bookRepo.find({
            where: { id: In(ids) },
            skip: sort_is_not_rank ? (page - 1) * offset : undefined,
            take: sort_is_not_rank ? offset : undefined,
            order: sort_is_not_rank ? { [sort.by]: sort.method } : undefined,
        }),
        getBooksInfo,
    );

    {
        /* const res: ParseResponseType<ILibraryMethods['searchBooks']> = {
            books: sort_is_not_rank
                ? books
                : syncIndexBy(
                      (e) => e.id,
                      ids.map((id) => ({ id })),
                      books,
                  ),
        }; */
        const res = sort_is_not_rank
            ? books
            : syncIndexBy(
                  (e) => e.id,
                  ids.map((id) => ({ id })),
                  books,
              );
        ctx.body = res;
    }
});
/* 
export const searchBooks = async (ctx: Context<any>) => {
    const {
        q: _q = '',
        search_type = '',
        book_type,
        offset = 25,
        page = 1,
        sort: _sort = 'created_desc', // rank_asc | created_desc | created_asc
    }: ParseRequestType<ILibraryMethods['searchBooks']> = ctx.req;

    const q = _q.trim();

    const sort = parseSortQuery(_sort);

    const validate = searchBooksRequestSchema.validate({
        q,
        search_type,
        book_type,
        offset,
        page,
        sort,
    });

    if (validate.error) {
        const err = createGRPCError(
            validate.error.message,
            grpc.status.INVALID_ARGUMENT,
        );
        ctx.res = err;
        return;
    }

    const bookRepo = getRepository(Book);

    const query = searchQueryParser(q).toLowerCase();

    try {
        await getConnection().query(`SELECT to_tsquery($$${query}$$);`);
    } catch (error) {
        const err = createGRPCError(
            error.message || STATUS_CODES[400]!,
            grpc.status.INVALID_ARGUMENT,
        );
        ctx.res = err;
        return;
    }

    const sort_is_not_rank = sort.by !== 'rank';

    // prettier-ignore
    const sql = `SELECT id, ts_rank(${search_type}_tsv, to_tsquery($$${query}$$)) as rank
    FROM book_tsv
    WHERE ${search_type}_tsv @@ to_tsquery($$${query}$$)
    ${book_type ? `AND type_tsv @@ to_tsquery($$${book_type}$$)` : ''}
    ${sort_is_not_rank ? '' : `ORDER BY ${sort.by} ${sort.method}`}
    ${sort_is_not_rank ? '' : `OFFSET ${(page - 1) * offset}`}
    ${sort_is_not_rank ? '' : `LIMIT ${offset}`}
    -- ORDER BY ts_rank ${sort_is_not_rank ? 'DESC' : sort.method}
    -- OFFSET ${(page - 1) * offset}
    -- LIMIT ${offset};`;

    const searchedResults: {
        id: number;
        ts_rank: number;
    }[] = await getConnection().query(sql);

    const ids = searchedResults.map((e) => e.id);

    if (ids.length === 0) {
        const res: ParseResponseType<ILibraryMethods['searchBooks']> = {
            books: [],
        };
        ctx.res = res;
        return;
    }

    const books = await F.run(
        bookRepo.find({
            where: { id: In(ids) },
            skip: sort_is_not_rank ? (page - 1) * offset : undefined,
            take: sort_is_not_rank ? offset : undefined,
            order: sort_is_not_rank ? { [sort.by]: sort.method } : undefined,
        }),
        getBooksInfo,
    );

    {
        const res: ParseResponseType<ILibraryMethods['searchBooks']> = {
            books: sort_is_not_rank
                ? books
                : syncIndexBy(
                      (e) => e.id,
                      ids.map((id) => ({ id })),
                      books,
                  ),
        };
        ctx.res = res;
    }
};
 */
