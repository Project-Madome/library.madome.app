import * as safe from "safe-typeorm";
import { Entity, PrimaryColumn } from "typeorm";
import { Book, BookTag } from ".";

@Entity("book_tag_ref")
export class BookTagRef {
    @PrimaryColumn("int8", { generated: "increment" })
    public id!: number;

    @safe.Belongs.ManyToOne(
        () => Book,
        (book) => book.tags,
        "int4",
        "book_id",
        { index: true },
    )
    public book!: safe.Belongs.ManyToOne<Book, "int4">;

    @safe.Belongs.ManyToOne(
        () => BookTag,
        (tag) => tag.ref,
        "int4",
        "book_tag_id",
        { index: true },
    )
    public tag!: safe.Belongs.ManyToOne<BookTag, "int4">;
}
