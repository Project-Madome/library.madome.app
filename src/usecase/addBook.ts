import * as Joi from "joi";
import { getConnection } from "typeorm";

import * as entity from "../entity";
import * as dto from "../dto";
import { bookKind, bookTagKind } from "./payload";
import { transaction } from "../lib/transaction";
import { getLogger } from "../logger";
import { AlreadyExistsError, PayloadError } from "../error";
import { isNullOrUndefined } from "../type/guard";

const log = getLogger("usecase/addBook");

const payload = Joi.object()
    .keys({
        id: Joi.number().min(1).required(),
        title: Joi.string().min(1).required(),
        kind: Joi.valid(...bookKind("snake")).required(),
        language: Joi.string().required(),
        page: Joi.number().min(1).required(),
        tags: Joi.array()
            .items(
                Joi.array()
                    .items(
                        Joi.valid(...bookTagKind("kebab")).required(),
                        Joi.string().required(),
                    )
                    .min(2)
                    .max(2)
                    .required(),
            )
            .min(0)
            .required(),
        created_at: Joi.date().required(),
    })
    .required();

export type Payload = {
    id: number;
    title: string;
    kind: dto.BookKind.BookKind | null;
    language: string;
    page: number;
    tags: [string, string][];
    created_at: Date;
};

export const toPayload = ({
    id,
    title,
    kind,
    language,
    page,
    tags,
    created_at,
}: {
    id: number;
    title: string;
    kind: string;
    language: string;
    page: number;
    tags: [string, string][];
    created_at: string;
}): Payload => ({
    id,
    title,
    kind: dto.BookKind.fromSnakeCase(kind),
    language,
    page,
    tags,
    created_at: new Date(created_at),
});

export const execute = async (p: Payload): Promise<void> => {
    const kind = p.kind;
    const validate = payload.validate({
        ...p,
        kind: dto.BookKind.toSnakeCase(kind),
    });

    log.debug(validate.value);

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    if (isNullOrUndefined(kind)) {
        throw "unreachable";
    }

    await transaction(
        getConnection().createQueryRunner(),
        async (queryRunner) => {
            // for book tag ref
            let tagIds: number[] = [];

            /* 
                BookTag
            */

            if (p.tags.length > 0) {
                const existsTags = await queryRunner.manager
                    .getRepository(entity.BookTag)
                    .find({
                        where: p.tags.map(([kind, name]) => ({
                            kind,
                            name,
                        })),
                    });

                log.debug("existsTags =", existsTags);

                const newTags = p.tags
                    .filter(
                        ([kind, name]) =>
                            !existsTags.find(
                                (x) =>
                                    x.kind === kind &&
                                    x.name === name,
                            ),
                    )
                    .map((x) => entity.BookTag.new(...x));

                log.debug("newTags =", newTags);

                tagIds = existsTags.map((x) => x.id);

                if (newTags.length > 0) {
                    const newTagIds: number[] = (
                        await queryRunner.manager
                            .createQueryBuilder(
                                entity.BookTag,
                                "BookTag",
                            )
                            .insert()
                            .values(newTags)
                            .execute()
                    ).identifiers.map((x): number => x.id);

                    log.debug("newTagIds =", newTagIds);

                    tagIds = tagIds.concat(newTagIds);
                }

                log.debug("tagIds =", tagIds);
            }

            /* 
                Book
            */

            const book = entity.Book.new({
                id: p.id,
                title: p.title,
                language: p.language,
                kind: dto.BookKind.toEntity(kind),
                page: p.page,
                created_at: p.created_at,
            });

            const a = await queryRunner.manager
                .getRepository(entity.Book)
                .insert(book)
                .catch((e) => {
                    // unique_violation
                    if (e.code === "23505") {
                        throw new AlreadyExistsError(
                            "Already exists book",
                        );
                    }

                    throw e;
                });

            log.debug("insertResult of Book =", a);

            /* 
                BookTagRef
            */

            if (tagIds.length > 0) {
                const bookTagRefs = tagIds.map((tagId) => ({
                    book_id: p.id,
                    book_tag_id: tagId,
                }));

                const aa = await queryRunner.manager
                    .getRepository(entity.BookTagRef)
                    .insert(bookTagRefs as any); // eslint-disable-line @typescript-eslint/no-explicit-any

                log.debug("insertResult of BookTagRef =", aa);
            }

            /* 
                Tsvector
            */

            const tags = p.tags
                .map(([kind, name]) =>
                    `${kind} ${name}`.replaceAll(" ", "+"),
                )
                .join(" ");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _r = await getConnection()
                .createQueryBuilder(
                    entity.BookTsvector,
                    "book_tsvector",
                )
                .insert()
                .values({
                    id: book.id,
                    title_tsv: () => "to_tsvector('simple', :title)",
                    tag_tsv: () => "to_tsvector('simple', :tag)",
                })
                .setParameters({ title: book.title, tag: tags })
                .execute();
        },
    );
};
