import * as Joi from "joi";
import { getRepository } from "typeorm";

import Book from "../entity/Book";

import { getExt } from "../lib/getExt";
import { getFile } from "../client/fileRepository";
import { router } from ".";

const getBookImageListRequestSchema = Joi.object({
    id: Joi.number().required(),
});

export const getBookImageList = router.get("/v1/book/:book_id/image/list", async (ctx) => {
    const { book_id } = ctx.params;
    const id = parseInt(book_id, 10);

    const validate = getBookImageListRequestSchema.validate({ id });

    if (validate.error) {
        const err = {
            code: 400,
            message: "INVALID_ARGUMENT",
        };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    const bookRepo = getRepository(Book);

    const book = await bookRepo.findOne({ id });

    if (!book) {
        const err = {
            code: 404,
            message: "NOT_FOUND",
        };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    // const exp = ms('30s') / 1000;
    // const imageListSignedURL = getSignedURL(`${id}`, exp);
    const imageURLs = await getFile<string>(book.id, "image_list.txt");

    let imageList = imageURLs
        .split("\n")
        .map(getExt)
        .map((e, i) => `${i + 1}${e}`);

    if (imageList.length !== book.page_count) {
        imageList = imageURLs
            .split(",")
            .map(getExt)
            .map((e, i) => `${i + 1}${e}`);

        if (imageList.length !== book.page_count) {
            const err = {
                code: 500,
                message: `Please tell me, ${id}`,
            };
            ctx.status = err.code;
            ctx.body = err;
            return;
        }
    }

    /* const res = {
            image_list: imageList,
        } */ ctx.body = imageList;
});
