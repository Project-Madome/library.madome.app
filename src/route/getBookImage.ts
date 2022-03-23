import { router } from ".";
import { getLogger } from "../logger";
import * as usecase from "../usecase";
import { catcher } from "./lib/catcher";

const log = getLogger("route/getBookImage");

export const getBookImage = router.get(
    "/books/:bookId/images/:filename",
    async (ctx) => {
        const { bookId, filename } = ctx.params;

        try {
            const { status, data } =
                await usecase.getBookImage.execute(
                    parseInt(bookId, 10),
                    filename,
                );

            ctx.status = status;
            ctx.body = data;
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
);
