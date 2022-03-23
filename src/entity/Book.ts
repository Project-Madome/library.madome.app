import * as safe from "safe-typeorm";
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import { BookTagRef } from ".";

export enum BookKind {
    Doujinshi = "doujinshi",
    Manga = "manga",
    ArtistCg = "artist_cg",
    GameCg = "game_cg",
}

@Entity("books")
export class Book {
    @PrimaryColumn("int4", { unique: true })
    public id!: number;

    @Index()
    @Column("varchar")
    public title!: string;

    @Column("varchar")
    public language!: string;

    @Column("int2")
    public page!: number;

    @Column("varchar") // TODO: to enum
    @Index()
    public kind!: BookKind;

    @CreateDateColumn()
    @Column("timestamptz")
    public created_at!: Date;

    @UpdateDateColumn()
    @Column("timestamptz")
    public updated_at!: Date;

    @safe.Has.OneToMany(() => BookTagRef, (book_tag) => book_tag.book)
    public tags!: safe.Has.OneToMany<BookTagRef>;

    public static new({
        id,
        title,
        language,
        page,
        kind,
        created_at,
    }: {
        id: number;
        title: string;
        language: string;
        page: number;
        kind: BookKind;
        created_at: Date;
    }): Book {
        const book = new Book();

        book.id = id;
        book.title = title;
        book.language = language;
        book.page = page;
        book.kind = kind;
        book.created_at = created_at;
        book.updated_at = created_at;

        return book;
    }
}
