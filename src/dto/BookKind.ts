import * as entity from "../entity";

export enum BookKind {
    Doujinshi,
    Manga,
    ArtistCg,
    GameCg,
}

export const fromEntity = (bookKind: entity.BookKind) => {
    switch (bookKind) {
        case entity.BookKind.Doujinshi:
            return BookKind.Doujinshi;

        case entity.BookKind.Manga:
            return BookKind.Manga;

        case entity.BookKind.ArtistCg:
            return BookKind.ArtistCg;

        case entity.BookKind.GameCg:
            return BookKind.GameCg;
    }
};

export const toEntity = (bookKind: BookKind): entity.BookKind => {
    switch (bookKind) {
        case BookKind.Doujinshi:
            return entity.BookKind.Doujinshi;

        case BookKind.Manga:
            return entity.BookKind.Manga;

        case BookKind.ArtistCg:
            return entity.BookKind.ArtistCg;

        case BookKind.GameCg:
            return entity.BookKind.GameCg;
    }
};

export function toKebabCase(
    bookKind: BookKind | null | undefined,
): string | null | undefined {
    switch (bookKind) {
        case BookKind.Doujinshi:
            return "doujinshi";

        case BookKind.Manga:
            return "manga";

        case BookKind.ArtistCg:
            return "artist-cg";

        case BookKind.GameCg:
            return "game-cg";

        default:
            return bookKind;
    }
}

export const fromKebabCase = (x: string): BookKind | null => {
    switch (x) {
        case "doujinshi":
            return BookKind.Doujinshi;

        case "manga":
            return BookKind.Manga;

        case "artist-cg":
            return BookKind.ArtistCg;

        case "game-cg":
            return BookKind.GameCg;

        default:
            return null;
    }
};

export const fromSnakeCase = (x: string): BookKind | null => {
    switch (x) {
        case "doujinshi":
            return BookKind.Doujinshi;

        case "manga":
            return BookKind.Manga;

        case "artist_cg":
            return BookKind.ArtistCg;

        case "game_cg":
            return BookKind.GameCg;

        default:
            return null;
    }
};

export const toSnakeCase = (
    bookKind: BookKind | null | undefined,
): string | null | undefined => {
    switch (bookKind) {
        case BookKind.Doujinshi:
            return "doujinshi";

        case BookKind.Manga:
            return "manga";

        case BookKind.ArtistCg:
            return "artist_cg";

        case BookKind.GameCg:
            return "game_cg";

        default:
            return bookKind;
    }
};
