import * as KoaRouter from "koa-router";

export const router = new KoaRouter();
/* 
router.get(
    "/v1/books",
    (ctx, next) => {
        const { ids: queryids = "" } = ctx.request.query as any;

        const ids = (queryids as string)
            .split(";")
            .map((id) => parseInt(id, 10))
            .filter((id) => Number.isInteger(id));

        if (ids.length <= 0) {
            return next();
        }

        return getBooksByIDs(ctx, ids);
    },
    (ctx, next) => {
        const {
            "book-type": book_type,
            random,
            offset,
            page,
            sort,
        } = ctx.request.query as any;

        if (random !== "true" || sort !== "random") {
            return next();
        }

        return getBooksByRandom(ctx, {
            book_type,
            offset: parseInt(offset, 10),
            page: parseInt(page, 10),
        });
    },
    (ctx, next) => {
        const {
            "metadata-type": metadata_type,
            "metadata-value": metadata_value,
            "book-type": book_type,
            offset = "25",
            page = "1",
            sort = "created_desc",
        } = ctx.request.query as any;

        if (!metadata_type || !metadata_value) {
            return next();
        }

        return getBooksByMetadata(ctx, {
            metadata_type,
            metadata_value,
            book_type,
            offset: parseInt(offset, 10),
            page: parseInt(page, 10),
            sort,
        });
    },
    (ctx) => {
        const {
            "book-type": book_type,
            offset = "25",
            page = "1",
            sort = "created_desc",
        } = ctx.request.query as any;

        return getBooks(ctx, {
            book_type,
            offset: parseInt(offset, 10),
            page: parseInt(page, 10),
            sort,
        });
    },
);
 */
