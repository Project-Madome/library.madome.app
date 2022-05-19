import * as safe from "safe-typeorm";
import { Brackets, MigrationInterface, QueryRunner } from "typeorm";

import { Book, BookTag, BookTsvector } from "../src/entity";

export class migrateV21647253889140 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const migrate_book: string = `
            INSERT INTO books(id, title, kind, page, language, created_at, updated_at)
            SELECT id, title, type AS kind, page_count AS page, language, created_at, created_at AS updated_at
            FROM book
        `;

        // kind = "aritst cg" | "game cg"
        const update_book_kind = (kind: string) => `
            UPDATE books
                SET kind = '${kind.replace(" ", "_")}'
            WHERE
                kind = '${kind}'
        `;

        const migrate_book_tag: string = `
            INSERT INTO book_tags(kind, name)
            SELECT DISTINCT type::book_tags_kind_enum AS kind, name
            FROM book_metadata
        `;

        const migrate_book_tag_ref: string = `
            INSERT INTO book_tag_ref(book_id, book_tag_id)
            SELECT book_id, book_tag_id
            FROM (
                SELECT fk_book_id as book_id, book_tags.id as book_tag_id
                FROM book_metadata
                LEFT JOIN book_tags
                    ON book_tags.kind = book_metadata.type::book_tags_kind_enum
                    AND book_tags.name = book_metadata.name
            ) as c
        `;

        // kind = "female" | "male" | "misc"
        const update_book_tag_kind = (kind: string) =>
            queryRunner.manager
                .createQueryBuilder()
                .update(BookTag)
                .set({
                    kind: () => `'${kind}'`,
                    name:
                        kind === "misc"
                            ? () => "name"
                            : () => `replace(name, '${kind} ', '')`,
                })
                .where(
                    new Brackets((x) =>
                        kind === "misc"
                            ? x
                                  .where("kind = 'tag'")
                                  .andWhere("NOT name LIKE 'female%'")
                                  .andWhere("NOT name LIKE 'male%'")
                            : x
                                  .where("kind = 'tag'")
                                  .andWhere(`name LIKE '${kind}%'`),
                    ),
                )
                .execute();

        await queryRunner.query(migrate_book);
        await Promise.all([
            queryRunner.query(update_book_kind("artist cg")),
            queryRunner.query(update_book_kind("game cg")),
        ]);

        await queryRunner.query(migrate_book_tag);
        await queryRunner.query(migrate_book_tag_ref);
        await Promise.all([
            update_book_tag_kind("female"),
            update_book_tag_kind("male"),
            update_book_tag_kind("misc"),
        ]);

        // TODO: Add tsvector

        let i = 0;

        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const books = await safe
                    .createJoinQueryBuilder(Book, "Book", (book) => {
                        book.leftJoinAndSelect("tags", (tagRef) =>
                            tagRef.leftJoinAndSelect("tag"),
                        );
                    })
                    .take(1000)
                    .skip(i * 1000)
                    .orderBy("Book.id", "DESC")
                    .getMany();

                if (books.length <= 0) {
                    break;
                }

                await Promise.all(
                    books.map(async (book) => {
                        const tag_refs = await book.tags.get();

                        const tags = (
                            await Promise.all(
                                tag_refs.map((x) => x.tag.get()),
                            )
                        )
                            .map((x) => [x.kind, x.name])
                            .map(([kind, name]) =>
                                `${kind} ${name}`.replaceAll(
                                    " ",
                                    "+",
                                ),
                            )
                            .join(" ");

                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const _r = await queryRunner.manager
                            .createQueryBuilder(
                                BookTsvector,
                                "book_tsvector",
                            )
                            .insert()
                            .values({
                                id: book.id,
                                title_tsv: () =>
                                    "to_tsvector('simple', :title)",
                                tag_tsv: () =>
                                    "to_tsvector('simple', :tag)",
                            })
                            .setParameters({
                                title: book.title,
                                tag: tags,
                            })
                            .execute();
                    }),
                );

                i += 1;
            }
        } catch (e) {
            console.error(e);

            process.exit(1);
            // throw e;
        }

        // throw "";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async down(_queryRunner: QueryRunner): Promise<void> {}
}
