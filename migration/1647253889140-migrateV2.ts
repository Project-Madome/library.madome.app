import { Brackets, MigrationInterface, QueryRunner } from "typeorm";

import { BookTag } from "../src/entity";

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

        // TODO: support korean to tsvector

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

        // throw "";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async down(_queryRunner: QueryRunner): Promise<void> {}
}
