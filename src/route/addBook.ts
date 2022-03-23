import { EventEmitter } from "events";
import axios from "axios";

import { router } from ".";
import { env } from "../env";
import * as usecase from "../usecase";
import { catcher } from "./lib/catcher";
import { getLogger } from "../logger";

const log = getLogger("route/addBook");

const event = new EventEmitter();

const sendNotification = (
    id: number,
    title: string,
    tags_: string[],
) => {
    const tags = tags_
        .map((x) => x.split(" "))
        .map((x) => ({
            kind: x.shift() as string,
            name: x.join(" "),
        }));

    return axios.post(
        `${env.MADOME_USER_URL}/users/notifications`,
        {
            kind: "book",
            book_id: id,
            book_title: title,
            book_tags: tags,
        },
        {
            validateStatus: () => true,
        },
    );
};

event.on("addedBook", (id, title, tags) => {
    sendNotification(id, title, tags);
});

export const addBook = router.post("/books", async (ctx) => {
    const {
        id,
        title,
        kind,
        page,
        language,
        created_at,
        tags = [],
    } = ctx.request.body as {
        id: number;
        title: string;
        kind: string;
        page: number;
        language: string;
        created_at: string;
        tags: [string, string][];
    };

    try {
        /* const _r = */ await usecase.addBook.execute(
            usecase.addBook.toPayload({
                id,
                title,
                kind,
                page,
                language,
                created_at,
                tags,
            }),
        );

        // event.emit("addedBook", id, title, tags);

        ctx.status = 201;
        ctx.body = { id };
    } catch (error) {
        log.error(error);
        catcher(error, ctx);
    }
});
