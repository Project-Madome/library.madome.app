import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity("book_tsvector")
export class BookTsvector {
    @PrimaryColumn("int", { unique: true })
    public id!: number;

    @Column("tsvector")
    @Index()
    public title_tsv!: unknown;

    @Column("tsvector")
    @Index()
    public tag_tsv!: unknown;
}
