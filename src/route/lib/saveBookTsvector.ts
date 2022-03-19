import * as R from "ramda";
import { QueryRunner } from "typeorm";
import Book from "../../entity/Book";

export const replaceSpaceToPlus = R.replace(/ /g, "+");

export const sexEmojiToString = (str: string) => {
    const female = "♀";
    const male = "♂";
    if (str.includes(female)) {
        // female
        const r = `female ${str.replace(female, "").trim()}`;
        return r;
    }

    if (str.includes(male)) {
        const r = `male ${str.replace(male, "").trim()}`;
        return r;
    }
    return str;
};

export const saveTsvectorOfBook = (
    queryRunner: QueryRunner,
    book: Book,
    g: string[],
    c: string[],
    a: string[],
    s: string[],
    t: string[],
) => {
    const group = g.map(replaceSpaceToPlus).join(" ");
    const characters = c.map(replaceSpaceToPlus).join(" ");
    const artists = a.map(replaceSpaceToPlus).join(" ");
    const series = s.map(replaceSpaceToPlus).join(" ");
    const tags = t.map(replaceSpaceToPlus).join(" ");
    // .map(sexEmojiToString)

    const title_tsv = `to_tsvector('simple', $$${book.title}$$)`;
    const group_tsv = `to_tsvector('simple', $$${group}$$)`;
    const character_tsv = `to_tsvector('simple', $$${characters}$$)`;
    const artist_tsv = `to_tsvector('simple', $$${artists}$$)`;
    const series_tsv = `to_tsvector('simple', $$${series}$$)`;
    const tag_tsv = `to_tsvector('simple', $$${tags}$$)`;
    const type_tsv = `to_tsvector('simple', $$${book.type}$$)`;

    // prettier-ignore
    const query = `INSERT INTO book_tsv (id, title_tsv, group_tsv, character_tsv, artist_tsv, series_tsv, tag_tsv, type_tsv)
    VALUES (${book.id},
            ${title_tsv},
            ${group_tsv},
            ${character_tsv},
            ${artist_tsv},
            ${series_tsv},
            ${tag_tsv},
            ${type_tsv}
            )
    ON CONFLICT (id)
    DO UPDATE SET
            title_tsv = ${title_tsv},
            group_tsv = ${group_tsv},
            character_tsv = ${character_tsv},
            artist_tsv = ${artist_tsv},
            series_tsv = ${series_tsv},
            tag_tsv = ${tag_tsv},
            type_tsv = ${type_tsv};`;

    return queryRunner.query(query);
};
