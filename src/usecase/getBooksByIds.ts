import * as Joi from "joi";
import { createJoinQueryBuilder } from "safe-typeorm";

import { PayloadError } from "../error";
import { getLogger } from "../logger";
import * as entity from "../entity";
import * as dto from "../dto";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = getLogger("usecase/getBooksByIds");

const payload = Joi.object({
    bookIds: Joi.array()
        .items(Joi.number().min(1).required())
        .min(1)
        .max(100)
        .unique()
        .required(),
});

export const execute = async (
    bookIds: number[],
): Promise<dto.Book.Book[]> => {
    const validate = payload.validate({
        bookIds,
    });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    const query = createJoinQueryBuilder(entity.Book, (book) => {
        book.leftJoinAndSelect("tags", (tag) =>
            tag.leftJoinAndSelect("tag"),
        );
    })
        .select()
        .whereInIds(bookIds);

    for (const param of bookIds.map((_, i) => i + 1)) {
        query.addOrderBy(`Book.id = $${param}`, "DESC");
    }

    const books = await query.getMany();

    return Promise.all(books.map(dto.Book.fromEntity));
};
