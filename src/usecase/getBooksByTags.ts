import { iterator } from "@syrflover/iterator";
import * as Joi from "joi";

import { PayloadError } from "../error";
import * as dto from "../dto";
import * as entity from "../entity";
import { createJoinQueryBuilder } from "safe-typeorm";
import { getLogger } from "../logger";
import { createQueryBuilder } from "typeorm";
import { bookSortBy } from "./payload";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = getLogger("usecase/getBooksByTags");

const tag = Joi.array().items(Joi.string()).min(2).max(2).required();

const payload = Joi.object({
    tags: Joi.array().items(tag).min(1).max(100).required(),
    perPage: Joi.number().min(1).max(100).required(),
    page: Joi.number().min(1).required(),
    sortBy: Joi.allow(...bookSortBy("kebab")).required(),
});

export type Payload = {
    perPage?: number;
    page?: number;
    sortBy?: dto.BookSortBy.BookSortBy | null;
    tags?: [string, string][];
};

export const toPayload = ({
    perPage,
    page,
    sortBy,
    tags,
}: {
    tags: string[] | undefined; // [female-loli, female-anal]
    perPage: string | undefined;
    page: string | undefined;
    sortBy: string | undefined;
}): Payload => ({
    perPage: perPage ? parseInt(perPage, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
    sortBy: sortBy ? dto.BookSortBy.fromKebabCase(sortBy) : undefined,
    tags: tags
        ?.map((x) => x.split("-"))
        .map((x) => [x.shift(), x.join(" ")] as [string, string]),
});

const ranking = (
    where: string,
    perPage: number,
    page: number,
    sortBy: dto.BookSortBy.BookSortBy,
) =>
    createQueryBuilder()
        .select("id")
        .from(
            (x) =>
                x
                    .addSelect("id")
                    .addSelect(
                        `RANK() OVER (PARTITION BY f.book_tag_id ORDER BY ` +
                            // TODO:
                            dto.BookSortBy.toSort(
                                sortBy,
                                "f",
                            ).replace("id", "book_id") +
                            " " +
                            dto.BookSortBy.toOrder(sortBy) +
                            ")",
                        "rn",
                    )
                    .from(
                        (x) =>
                            x
                                .select("*")
                                .from(entity.BookTagRef, "TagRef")
                                .leftJoinAndSelect(
                                    (x) =>
                                        x
                                            .select("id", "tag_id")
                                            .from(entity.BookTag, "t")
                                            .where(where),
                                    "t",
                                    "true",
                                )
                                .where(
                                    "TagRef.book_tag_id = t.tag_id",
                                ),
                        "f",
                    ),
            "ranking",
        )
        .where("ranking.rn >= " + `${page * perPage - (perPage - 1)}`)
        .andWhere("ranking.rn <= " + `${page * perPage}`)
        .getQuery();

export const execute = async ({
    tags = [],
    perPage = 3,
    page = 1,
    sortBy = dto.BookSortBy.BookSortBy.IdDesc,
}: Payload): Promise<[[string, string], dto.Book.Book[]][]> => {
    const validate = payload.validate({
        tags,
        perPage,
        page,
        sortBy,
    });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    if (!sortBy) {
        throw "unreachable";
    }

    const where = tags
        .map((_, i) => `(kind = :${i}_kind AND name = :${i}_name)`)
        .join(" OR ");
    const params: { [key: string]: string } = {};

    tags.forEach(([kind, name], i) => {
        params[`${i}_kind`] = kind;
        params[`${i}_name`] = name;
    });

    const query = createJoinQueryBuilder(entity.BookTagRef, (ref) => {
        ref.leftJoinAndSelect("tag");
        ref.leftJoinAndSelect("book")
            .leftJoinAndSelect("tags", "TagRef")
            .leftJoinAndSelect("tag", "Tag");
    })
        .where(
            "BookTagRef.id IN (" +
                ranking(where, perPage, page, sortBy) +
                ")",
            params,
        )
        .orderBy(
            dto.BookSortBy.toSort(sortBy, "Book"),
            dto.BookSortBy.toOrder(sortBy),
        );

    const books = await Promise.all(
        (
            await query.getMany()
        ).map(async (x) => ({
            ...x,
            book: await dto.Book.fromEntity(await x.book.get()),
            tag: await dto.BookTag.fromEntity(await x.tag.get()),
        })),
    );

    // log.debug(books);

    const ret = new Map<string, dto.Book.Book[]>();

    const seperator = "$";
    for (const {
        tag: { kind, name },
        book,
    } of books) {
        const key = `${kind}${seperator}${name}`;

        if (ret.has(key)) {
            ret.get(key)?.push(book);
        } else {
            ret.set(key, [book]);
        }
    }

    return iterator(ret.entries())
        .map(([tag, book]) => [tag.split(seperator), book])
        .collect() as Promise<[[string, string], dto.Book.Book[]][]>;
};

/* 

select * from book_tag_ref a
left join book_tags b
    on b.id = a.book_tag_id
left join books c
    on c.id = a.book_id
left join book_tag_ref d
    on d.book_id = a.book_id
left join book_tags e
    on e.id = d.book_tag_id
where
    a.id in (
        select id
        from (
            select id, RANK() over (partition by f.book_tag_id order by f.book_id desc) as rn
            from (
                select * from book_tag_ref tag_ref
                left join (
                		select id as tag_id
                		from book_tags
                		where
                            (kind = 'artist' and name = 'nyuu') or
                            (kind = 'female' and name = 'loli') or
                            (kind = 'female' and name = 'anal') or
                            (kind = 'female' and name = 'sole female') or
                            (kind = 'male' and name = 'sole male') or
                            (kind = 'female' and name = 'large insertions') or
                            (kind = 'male' and name = 'shota') or
                            (kind = 'female' and name = 'netorare')
                	) tag
                    on true
                where
                    tag_ref.book_tag_id = tag.tag_id
            ) f
        ) as ranking
        where ranking.rn <= 3
    )
order by c.id desc

*/
