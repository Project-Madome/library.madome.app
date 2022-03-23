import { Column, Entity, PrimaryColumn } from "typeorm";

// @Entity("book_tsv")
@Entity("book_tsvector")
export class BookTsvector {
    @PrimaryColumn("int", { unique: true })
    public id!: number;

    @Column("tsvector")
    public title_tsv!: unknown;

    @Column("tsvector")
    public group_tsv!: unknown;

    @Column("tsvector")
    public character_tsv!: unknown;

    @Column("tsvector")
    public artist_tsv!: unknown;

    @Column("tsvector")
    public series_tsv!: unknown;

    @Column("tsvector")
    public tag_tsv!: unknown;

    @Column("tsvector")
    public type_tsv!: unknown;
}
