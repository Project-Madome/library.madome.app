import { router } from ".";
import { getLogger } from "../logger";
import * as usecase from "../usecase";
import { catcher } from "./lib/catcher";

const log = getLogger("route/getBookImageList");

export const getBookImageList = router.get(
    "/books/:bookId/images",
    async (ctx) => {
        const { bookId } = ctx.params;

        try {
            /* const imageList = await usecase.getBookImageList.execute(
                parseInt(bookId, 10),
            );
            
            ctx.status = 200;
            ctx.body = imageList;
            */

            const imageListUrl =
                await usecase.getBookImageUrl.execute(
                    parseInt(bookId, 10),
                    "image_list",
                );

            ctx.redirect(imageListUrl);
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
);
