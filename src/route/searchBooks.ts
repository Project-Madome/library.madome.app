import * as usecase from "../usecase";
import * as model from "../model";
import { router } from ".";
import { catcher } from "./lib/catcher";
import { getLogger } from "../logger";

const log = getLogger("route/searchBooks");

export const searchBooks = router.get(
    "/books/search",
    async (ctx) => {
        const {
            q,
            "search-kind": searchKind,
            "book-kind": bookKind,
            "per-page": perPage,
            page,
            "sort-by": sortBy,
        } = ctx.request.query as {
            [key: string]: string | undefined;
        };

        const payload = usecase.searchBooks.toPayload({
            query: q,
            searchKind,
            bookKind,
            sortBy,
            perPage,
            page,
        });

        log.debug("payload =", payload);

        try {
            const books = await usecase.searchBooks.execute(payload);

            ctx.status = 200;
            ctx.body = books.map(model.Book.fromDto);
        } catch (err) {
            log.error(err);
            catcher(err, ctx);
        }
    },
);
