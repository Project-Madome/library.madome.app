import * as Joi from "joi";
import { createJoinQueryBuilder } from "safe-typeorm";

import * as dto from "../dto";
import * as entity from "../entity";

import { NotFoundError, PayloadError } from "../error";

const payload = Joi.object({
    bookId: Joi.number().min(1).required(),
});

export const execute = async (
    bookId: number,
): Promise<dto.Book.Book> => {
    const validate = payload.validate({ bookId });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    const book = await createJoinQueryBuilder(entity.Book, (book) => {
        book.leftJoinAndSelect("tags", (tag) =>
            tag.leftJoinAndSelect("tag"),
        );
    })
        .select()
        .where("Book.id = :id", { id: bookId })
        .getOne();

    if (!book) {
        throw new NotFoundError("Not found book");
    }

    return dto.Book.fromEntity(book);
};
