import * as Joi from "joi";
import { getRepository } from "typeorm";

import Book from "../entity/Book";
import { generateFileURL } from "../client/fileRepository";
import { router } from ".";

const getBookImageURLRequestSchema = Joi.object({
    id: Joi.number().required(),
    filename: Joi.string().min(1).required(),
});

export const getBookImageURL = router.get("/v1/book/:book_id/image/:filename", async (ctx) => {
    const { authorization = "" } = ctx.request.headers;
    const { book_id, filename } = ctx.params;
    const id = parseInt(book_id, 10);

    const validate = getBookImageURLRequestSchema.validate({
        id,
        filename,
    });

    if (validate.error) {
        const err = { code: 400, message: "INVALID_ARGUMENT" };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    const bookRepo = getRepository(Book);

    const book = await bookRepo.findOne({ select: ["id"], where: { id } });

    if (!book) {
        const err = {
            code: 404,
            message: "NOT_FOUND",
        };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    // const exp = ms('5m') / 1000;

    // const image_url = getSignedURL(`${book.id}/${filename}`, exp);
    const image_url = generateFileURL(book.id, filename, false);
    ctx.redirect(image_url);

    /* const res: ParseResponseType<ILibraryMethods['getBookImageUrl']> = {
            image_url,
        }; */

    // ctx.res = res;
});
