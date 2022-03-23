import * as usecase from "../usecase";
import * as model from "../model";
import { router } from ".";
import { catcher } from "./lib/catcher";
import { getLogger } from "../logger";

const log = getLogger("route/getBookById");

export const getBookById = router.get(
    "/books/:book_id",
    async (ctx) => {
        const book_id = parseInt(ctx.params.book_id, 10);

        try {
            const book = await usecase.getBookById.execute(book_id);

            ctx.status = 200;
            ctx.body = model.Book.fromDto(book);
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
);
