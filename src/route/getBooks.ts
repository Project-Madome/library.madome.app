import * as qs from "qs";

import * as model from "../model";
import * as usecase from "../usecase";
import { router } from ".";
import { getLogger } from "../logger";
import { catcher } from "./lib/catcher";
import { isNullOrUndefined } from "../type/guard";

const log = getLogger("route/getBooks*");

export const getBooks = router.get(
    "/books",
    async (ctx, next) => {
        let { ids: bookIds } = qs.parse(ctx.request.querystring, {
            arrayLimit: Infinity,
        }) as {
            ids: string | string[] | undefined;
        };

        // let bookIds = ctx.request.query["ids[]"];

        if (isNullOrUndefined(bookIds)) {
            return next();
        }

        if (!Array.isArray(bookIds)) {
            bookIds = bookIds ? [bookIds] : [];
        }

        try {
            const books = await usecase.getBooksByIds.execute(
                bookIds.map((x) => parseInt(x, 10)),
            );

            ctx.status = 200;
            ctx.body = books.map(model.Book.fromDto);
        } catch (error) {
            log.error(error);
            catcher(error, ctx);
        }
    },
    async (ctx, next) => {
        const parsedQs = qs.parse(ctx.request.querystring, {
            arrayLimit: Infinity,
        });

        let { tags } = parsedQs as {
            tags: string | string[] | string[][] | undefined;
        };
        const {
            "per-page": perPage,
            page,
            "sort-by": sortBy,
        } = parsedQs;

        /* let tags = ctx.request.query["tags[]"];
        const {
            "per-page": perPage,
            page,
            "sort-by": sortBy,
        } = ctx.request.query as {
            "tags[]": string | string[] | undefined;
            "per-page": string | undefined;
            page: string | undefined;
            "sort-by": string | undefined;
        }; */

        if (isNullOrUndefined(tags)) {
            return next();
        }

        // log.debug("tags =", tags);

        if (!Array.isArray(tags)) {
            tags = tags ? [tags] : [];
        }

        const payload = usecase.getBooksByTags.toPayload({
            tags: tags as string[] | string[][] | undefined,
            perPage: perPage as string | undefined,
            page: page as string | undefined,
            sortBy: sortBy as string | undefined,
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
