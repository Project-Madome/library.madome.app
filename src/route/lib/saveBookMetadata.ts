import * as F from "nodekell";

import { QueryRunner } from "typeorm";

import BookTag from "../../entity/BookTag";

export const saveBookMetadata = (
    queryRunner: QueryRunner,
    book_id: number,
    datas: { type: string; name: string }[],
) =>
    F.run(
        datas,
        F.distinct,
        F.forEach(async ({ type, name }) => {
            const metadata = await queryRunner.manager.findOne(BookTag, {
                where: { fk_book_id: book_id, kind: type, name },
            });

            if (metadata) {
                return metadata;
            }

            const newBookMetadata = new BookTag();
            newBookMetadata.fk_book_id = book_id;
            newBookMetadata.kind = type;
            newBookMetadata.name = name;

            return queryRunner.manager.save(BookTag, newBookMetadata);
        }),
    );
