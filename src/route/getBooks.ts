import * as model from "../model";
import * as usecase from "../usecase";
import { router } from ".";
import { getLogger } from "../logger";
import { catcher } from "./lib/catcher";

const log = getLogger("route/getBooks*");

export const getBooks = router.get(
    "/books",
    async (ctx, next) => {
        let book_ids = ctx.request.query["ids[]"];

        if (!("ids[]" in ctx.request.query)) {
            return next();
        }

        if (!Array.isArray(book_ids)) {
            book_ids = book_ids ? [book_ids] : [];
        }

        try {
            const books = await usecase.getBooksByIds.execute(
                book_ids.map((x) => parseInt(x, 10)),
            );

            ctx.status = 200;
            ctx.body = books.map(model.Book.fromDto);
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
    async (ctx, next) => {
        let tags = ctx.request.query["tags[]"];
        const {
            "per-page": perPage,
            page,
            "sort-by": sortBy,
        } = ctx.request.query as {
            "tags[]": string | string[] | undefined;
            "per-page": string | undefined;
            page: string | undefined;
            "sort-by": string | undefined;
        };

        if (!("tags[]" in ctx.request.query)) {
            return next();
        }

        // log.debug("tags =", tags);

        if (!Array.isArray(tags)) {
            tags = tags ? [tags] : [];
        }

        const payload = usecase.getBooksByTags.toPayload({
            tags,
            perPage,
            page,
            sortBy,
        });

        log.debug("payload =", payload);

        try {
            const books = await usecase.getBooksByTags.execute(
                payload,
            );

            ctx.status = 200;
            ctx.body = books.map(([tag, book]) => [
                tag,
                book.map(model.Book.fromDto),
            ]);
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
    async (ctx) => {
        const {
            kind,
            "per-page": perPage,
            page,
            "sort-by": sortBy,
        } = ctx.request.query as {
            [key: string]: string | undefined;
        };

        try {
            const books = await usecase.getBooks.execute(
                usecase.getBooks.toPayload({
                    perPage,
                    page,
                    kind,
                    sortBy,
                }),
            );

            ctx.status = 200;
            ctx.body = books.map(model.Book.fromDto);
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
);
