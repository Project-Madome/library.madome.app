import { getRepository } from "typeorm";

import * as entity from "../entity";
import * as dto from "../dto";
import { router } from ".";
import { getLogger } from "../logger";
import { isNullOrUndefined } from "../type/guard";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = getLogger("route/addBook");

const hasBook = (id: number): Promise<boolean> => {
    return getRepository(entity.Book)
        .findOne({ select: ["id"], where: { id } })
        .then((x) => !isNullOrUndefined(x));
};

const hasBookTag = (kind: string, name: string): Promise<boolean> => {
    // TODO: validate kind
    if (!dto.BookTagKind.includes(kind, "snake")) {
        return Promise.resolve(false);
    }

    return getRepository(entity.BookTag)
        .findOne({
            select: ["id"],
            where: { kind, name },
        })
        .then((x) => !isNullOrUndefined(x));
};

router.post("/command", async (ctx) => {
    const { kind } = ctx.request.body;

    switch (kind) {
        case "has_book":
            {
                const { book_id: bookId } = ctx.request.body;

                ctx.body = { has: await hasBook(bookId) };
            }
            break;

        case "has_book_tag":
            {
                const { tag_kind: tagKind, tag_name: tagName } =
                    ctx.request.body;

                ctx.body = {
                    has: await hasBookTag(tagKind, tagName),
                };
            }
            break;

        default:
            ctx.status = 404;
            break;
    }
});
