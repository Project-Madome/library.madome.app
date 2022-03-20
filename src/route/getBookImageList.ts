import { router } from ".";
import * as usecase from "../usecase";

export const getBookImageList = router.get(
    "/books/:bookId/images",
    async (ctx) => {
        const { bookId } = ctx.params;

        const imageList = await usecase.getBookImageList.execute(
            parseInt(bookId, 10),
        );

        ctx.status = 200;
        ctx.body = imageList;
    },
);
