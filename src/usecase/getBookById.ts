import * as Joi from "joi";
import { createJoinQueryBuilder } from "safe-typeorm";

import * as entity from "../entity";
import * as dto from "../dto";
import { NotFoundError, PayloadError } from "../error";

const payload = Joi.object({
    book_id: Joi.number().min(1).required(),
});

export const execute = async (
    book_id: number,
): Promise<dto.Book.Book> => {
    const validate = payload.validate({ book_id });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    const book = await createJoinQueryBuilder(entity.Book, (book) => {
        book.leftJoinAndSelect("tags", (tag) =>
            tag.leftJoinAndSelect("tag"),
        );
    })
        .select()
        .where("Book.id = :id", { id: book_id })
        .getOne();

    if (!book) {
        throw new NotFoundError("Not found book");
    }

    return dto.Book.fromEntity(book);
};
