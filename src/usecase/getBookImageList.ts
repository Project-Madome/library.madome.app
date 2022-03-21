import * as Joi from "joi";
import axios from "axios";

import * as entity from "../entity";
import { env } from "../env";
import { InternalError, NotFoundError, PayloadError } from "../error";
import { getExt } from "../lib/getExt";
import { getRepository } from "typeorm";

const payload = Joi.object({
    bookId: Joi.number().min(1).required(),
});

export const execute = async (bookId: number): Promise<string[]> => {
    const validate = payload.validate({ bookId });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    const book = await getRepository(entity.Book).findOne({
        select: ["page"],
        where: {
            id: bookId,
        },
    });

    if (!book) {
        throw new NotFoundError("Not found book");
    }

    const r = await axios
        .get<string>(
            `${env.MADOME_FILE_URL}/v1/image/library/${bookId}/image_list`,
        )
        .then((x) => x.data);

    let imageList = r
        .split("\n")
        .map(getExt)
        .map((e, i) => `${i + 1}${e}`);

    if (imageList.length !== book.page) {
        imageList = r
            .split(",")
            .map(getExt)
            .map((e, i) => `${i + 1}${e}`);

        if (imageList.length !== book.page) {
            throw new InternalError(
                "E: Invalid image list; book_id = " + bookId,
            );
        }
    }

    return imageList;
};
