import { getConnection } from "typeorm";
import { isToken } from "./searchBooks";
import { router } from ".";

export const parseLastWords = (q: string) => {
    const sa = q.trim().split(" ");

    const words: string[] = [];

    for (const s of sa.reverse()) {
        if (isToken(s)) {
            break;
        }
        words.push(s);
    }

    return words.reverse().join(" ").trim();
};

const SELECT_DISTINCT_METADATA_NAME = (
    offset: number,
    page: number,
    type: string,
    name: string,
) => `
    SELECT
        DISTINCT name
    FROM book_metadata
    WHERE type = '${type}'
    AND name LIKE '${name}%'
    ORDER BY name ASC
    OFFSET ${(page - 1) * offset}
    LIMIT ${offset};`;

const SELECT_DISTINCT_BOOK_TITLE = (
    offset: number,
    page: number,
    type: string,
    title: string,
) => `
    SELECT
        DISTINCT title
    FROM book
    WHERE title LIKE '%${title}%'
    OFFSET ${(page - 1) * offset}
    LIMIT ${offset};`;

/* const searchBooksQueryCompleteRequestSchema = Joi.object().keys({
    q: Joi.string()
        .min(1)
        .required(),
    search_type: Joi.string()
        .only('group', 'character', 'title', 'artist', 'series', 'tag')
        .required(),
    offset: Joi.number()
        .min(1)
        .required(),
    page: Joi.number()
        .min(1)
        .required(),
}); */

router.get("/v1/books/search/complete", async (ctx) => {
    const {
        q: _q = "",
        type: search_type,
        offset = "15",
        page = "1",
    } = ctx.request.query as any;

    /* const {
        q: _q,
        search_type,
        offset = 15,
        page = 1,
    }: ParseRequestType<ILibraryMethods['searchBooksQueryComplete']> = ctx.req; */
    const q = _q.trim();

    const lastWords = parseLastWords(q).toLowerCase().trim();

    if (lastWords.length === 0) {
        /* const res: ParseResponseType<
            ILibraryMethods['searchBooksQueryComplete']
        > = { completed_words: '[]' }; */
        ctx.body = [];
        return;
    }

    const args: [number, number, string, string] = [
        offset,
        page,
        search_type,
        lastWords,
    ];

    const sql =
        search_type === "title"
            ? SELECT_DISTINCT_BOOK_TITLE(...args)
            : SELECT_DISTINCT_METADATA_NAME(...args);

    const metadataList = await getConnection().query(sql);

    const lastWordsRegExp = new RegExp(`${lastWords}$`);
    const calFullStr = (a: string) => q.replace(lastWordsRegExp, a);

    const completed_words =
        search_type === "title"
            ? metadataList.map((e: any) => ({
                  completion: e.title,
                  full_string: calFullStr(e.title),
              }))
            : metadataList.map((e: any) => ({
                  completion: e.name,
                  full_string: calFullStr(e.name),
              }));

    {
        /* const res: ParseResponseType<
            ILibraryMethods['searchBooksQueryComplete']
        > = {
            completed_words: JSON.stringify(completed_words),
        }; */

        ctx.res = completed_words;
    }
});
/* 
export const searchBooksQueryComplete = async (ctx: Context<any>) => {
    const {
        q: _q,
        search_type,
        offset = 15,
        page = 1,
    }: ParseRequestType<ILibraryMethods['searchBooksQueryComplete']> = ctx.req;

    const q = _q.trim();

    const lastWords = parseLastWords(q).toLowerCase().trim();

    if (lastWords.length === 0) {
        const res: ParseResponseType<
            ILibraryMethods['searchBooksQueryComplete']
        > = { completed_words: '[]' };
        ctx.res = res;
        return;
    }

    const args: [number, number, string, string] = [
        offset,
        page,
        search_type,
        lastWords,
    ];

    const sql =
        search_type === 'title'
            ? SELECT_DISTINCT_BOOK_TITLE(...args)
            : SELECT_DISTINCT_METADATA_NAME(...args);

    const metadataList = await getConnection().query(sql);

    const lastWordsRegExp = new RegExp(`${lastWords}$`);
    const calFullStr = (a: string) => q.replace(lastWordsRegExp, a);

    const completed_words =
        search_type === 'title'
            ? metadataList.map((e: any) => ({
                  completion: e.title,
                  full_string: calFullStr(e.title),
              }))
            : metadataList.map((e: any) => ({
                  completion: e.name,
                  full_string: calFullStr(e.name),
              }));

    {
        const res: ParseResponseType<
            ILibraryMethods['searchBooksQueryComplete']
        > = {
            completed_words: JSON.stringify(completed_words),
        };

        ctx.res = res;
    }
};

// console.log(parseLastWords('female anal AND netorare AND female sex toys'));
 */
