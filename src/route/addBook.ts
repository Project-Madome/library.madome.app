import { getConnection, getRepository } from "typeorm";

import { transaction } from "../lib/transaction";
import { toMetadata } from "./lib/toMetadata";
import { sexEmojiToString } from "../lib/sexEmojiToString";
import { saveBookMetadata } from "./lib/saveBookMetadata";
import { saveTsvectorOfBook } from "./lib/saveBookTsvector";
import Book from "../entity/Book";
import { router } from ".";
import axios from "axios";
import { env } from "../env";
import EventEmitter = require("events");

const event = new EventEmitter();

const sendNotification = (id: number, title: string, tags_: string[]) => {
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

export const addBook = router.post("/v1/book", async (ctx) => {
    const {
        id,
        title,
        kind,
        page_count,
        language,
        created_at: cdt,
        group = [],
        characters = [],
        artists = [],
        series = [],
        tags = [],
    } = ctx.request.body as {
        id: number;
        title: string;
        kind: string;
        page_count: number;
        language: string;
        created_at: string;
        group: string[];
        characters: string[];
        artists: string[];
        series: string[];
        tags: string[];
    };

    const created_at = new Date(cdt);

    const bookRepo = getRepository(Book);

    const conflictBook = await bookRepo.findOne({
        select: ["id"],
        where: { id },
    });

    if (conflictBook) {
        const err = {
            code: 409,
            message: "ALREADY_EXISTS",
        };
        ctx.status = err.code;
        ctx.body = err;
        return;
    }

    const newBook = new Book();
    newBook.id = id;
    newBook.title = title;
    newBook.type = kind.toLowerCase().trim();
    newBook.page_count = page_count;
    newBook.language = language;
    newBook.created_at = created_at;

    const metadata_group = toMetadata(group, "group");
    const metadata_character = toMetadata(characters, "character");
    const metadata_artists = toMetadata(artists, "artist");
    const metadata_series = toMetadata(series, "series");
    // const metadata_tags = toMetadata(tags.map(sexEmojiToString), 'tag');

    const female_tags = toMetadata(
        tags
            .map(sexEmojiToString)
            .filter((x: string) => x.startsWith("female"))
            .map((x: string) => x.replace("female", "").trim()),
        "female",
    );
    const male_tags = toMetadata(
        tags
            .map(sexEmojiToString)
            .filter((x: string) => x.startsWith("male"))
            .map((x: string) => x.replace("male", "").trim()),
        "male",
    );
    const misc_tags = toMetadata(
        tags
            .map(sexEmojiToString)
            .filter((x: string) => !x.startsWith("female") && !x.startsWith("male"))
            .map((x: string) => x.trim()),
        "female",
    );

    const metadata = [
        ...metadata_group,
        ...metadata_character,
        ...metadata_artists,
        ...metadata_series,
        ...female_tags,
        ...male_tags,
        ...misc_tags,
    ];

    const queryRunner = getConnection().createQueryRunner();

    await transaction(queryRunner, async () => {
        await queryRunner.manager.save(Book, newBook);
        await Promise.all([
            saveBookMetadata(queryRunner, id, metadata),
            saveTsvectorOfBook(queryRunner, newBook, group, characters, artists, series, tags),
        ]);
    });

    const book = {
        ...newBook,
        created_at: newBook.created_at.toISOString(),
        group,
        characters,
        artists,
        series,
        tags,
    };

    event.emit("addedBook", book.id, book.title, book.tags);

    ctx.body = book;
});

/* export const addBook = async (ctx: Context) => {
        const {
        id,
        title,
        type,
        page_count,
        language,
        created_at: cdt,
        group = [],
        characters = [],
        artists = [],
        series = [],
        tags = [],
    }: ParseRequestType<ILibraryMethods['addBook']> = ctx.req;

    const {} = ctx.request.body;
}; */
