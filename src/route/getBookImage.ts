import { router } from ".";
import * as usecase from "../usecase";

export const getBookImageURL = router.get(
    "/books/:bookId/images/:filename",
    async (ctx) => {
        const { bookId, filename } = ctx.params;

        const { status, data } = await usecase.getBookImage.execute(
            parseInt(bookId, 10),
            filename,
        );

        ctx.status = status;
        ctx.body = data;
    },
);
