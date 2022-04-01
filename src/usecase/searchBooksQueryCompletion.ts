import { getConnection } from "typeorm";

import * as entity from "../entity";
import * as dto from "../dto";
import { isToken } from "./searchBooks";
import { enumIter } from "../lib/enumIter";
import { PayloadError } from "../error";

const parseLastKeywords = (q: string) => {
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

export type Payload = {
    query: string;
    searchKind: string;
    perPage?: number;
    page?: number;
};

export const toPayload = ({
    query,
    searchKind,
    perPage,
    page,
}: {
    [key: string]: string | undefined;
}): Payload => ({
    query: query?.trim() || "",
    searchKind: searchKind || "",
    perPage: perPage ? parseInt(perPage, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
});

export const execute = async ({
    query,
    searchKind,
    perPage = 15,
    page = 1,
}: Payload): Promise<{ keyword: string; completion?: string }[]> => {
    if (perPage > 100) {
        throw new PayloadError(
            '"perPage" must be less than or equal to 100',
        );
    }

    // female anal AND female sole femal <- 이 뒷부분 female sole femal
    const lastKeywords = parseLastKeywords(query);

    if (lastKeywords.length === 0) {
        return [];
    }

    let c: string[] = [];

    if (searchKind === "tag") {
        const [kind, ...names] = lastKeywords.split(" ");
        const name = names.join(" ");

        if (dto.BookTagKind.includes(kind, "kebab")) {
            const sql = getConnection()
                .createQueryBuilder(entity.BookTag, "book_tag")
                .where("kind = :kind", { kind })
                .andWhere("name LIKE :name", {
                    name: name + "%",
                })
                .skip(perPage * (page - 1))
                .take(perPage)
                .orderBy("name", "ASC");

            const tags = await sql.getMany();

            c = tags.map((x) => x.kind + " " + x.name);
        } else {
            c = enumIter(dto.BookTagKind.BookTagKind)
                .map(dto.BookTagKind.toKebabCase)
                .filter((x) => x.startsWith(kind));
        }
    } else if (searchKind === "title") {
        const sql = getConnection()
            .createQueryBuilder(entity.Book, "book")
            .select("title")
            .distinctOn(["title"])
            .where("title LIKE $1")
            .orderBy("title", "ASC")
            .skip(perPage * (page - 1))
            .take(perPage)
            .getQuery();

        const books: { title: string }[] =
            await getConnection().query(sql, [
                "%" + lastKeywords + "%",
            ]);

        c = books.map((x) => x.title);
    } else {
        throw new PayloadError(
            '"searchKind" must be one of [title, tag]',
        );
    }

    // const lastWordsRegExp = new RegExp(`${last}$`);
    // last뿐만 아니라 이전 것들까지 합쳐놓음
    // const toQuery = (q: string, x: string) =>
    //     q.replace(lastWordsRegExp, x);

    return c.map((x) => ({
        keyword: x,
        completion:
            // x LIKE 'keyword%'
            // 이런식으로 startsWith 방식으로 검색하는 경우에는 completion을 지원해줄 수 있는데
            // x LIKE '%keyword%'
            // includes 방식으로 검색하는 경우에는 completion을 지원해줄 수 없음
            searchKind === "tag"
                ? x.replace(lastKeywords, "")
                : undefined,
        // query: toQuery(query, x),
    }));
};
