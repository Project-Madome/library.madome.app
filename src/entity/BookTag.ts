import * as safe from "safe-typeorm";
import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { BookTagRef } from ".";

export enum BookTagKind {
    Artist = "artist",
    Group = "group",
    Series = "series",
    Character = "character",
    Female = "female",
    Male = "male",
    Misc = "misc",
    Tag = "tag", // for migration
}

// @Entity("book_metadata")
@Entity("book_tags")
export class BookTag {
    @PrimaryColumn("int4", { generated: "increment" })
    public id!: number;

    @Column({
        type: "enum",
        enum: BookTagKind,
    })
    @Index()
    public kind!: BookTagKind;

    @Column("varchar")
    @Index()
    public name!: string;

    @safe.Has.OneToMany(() => BookTagRef, (ref) => ref.tag)
    public ref!: safe.Has.OneToMany<BookTagRef>;

    public static new(kind: string, name: string): BookTag {
        const bookTag = new BookTag();

        bookTag.kind = kind as BookTagKind;
        bookTag.name = name;

        return bookTag;
    }
}
