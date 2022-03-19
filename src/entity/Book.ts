import * as safe from "safe-typeorm";
import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
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
}
