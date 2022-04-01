import * as usecase from "../usecase";
import { router } from ".";
import { getLogger } from "../logger";
import { catcher } from "./lib/catcher";

const log = getLogger("route/searchBooksQueryCompletion");

router.get("/books/search/completion", async (ctx) => {
    const {
        q,
        "search-kind": searchKind,
        "per-page": perPage,
        page,
    } = ctx.request.query as { [key: string]: string | undefined };

    const payload = usecase.searchBooksQueryCompletion.toPayload({
        query: q,
        searchKind,
        perPage,
        page,
    });

    try {
        const searchQueryCompletion =
            await usecase.searchBooksQueryCompletion.execute(payload);

        ctx.status = 200;
        ctx.body = searchQueryCompletion;
    } catch (error) {
        log.error(error);
        catcher(error, ctx);
    }
});
