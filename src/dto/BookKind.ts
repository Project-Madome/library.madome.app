import * as entity from "../entity";

export enum BookKind {
    Doujinshi,
    Manga,
    ArtistCg,
    GameCg,
}

export const fromEntity = (book_kind: entity.BookKind) => {
    switch (book_kind) {
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

export const toKebabCase = (bookKind: BookKind): string => {
    switch (bookKind) {
        case BookKind.Doujinshi:
            return "doujinshi";

        case BookKind.Manga:
            return "manga";

        case BookKind.ArtistCg:
            return "artist-cg";

        case BookKind.GameCg:
            return "game-cg";
    }
};

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

export const toSnakeCase = (bookKind: BookKind): string => {
    switch (bookKind) {
        case BookKind.Doujinshi:
            return "doujinshi";

        case BookKind.Manga:
            return "manga";

        case BookKind.ArtistCg:
            return "artist_cg";

        case BookKind.GameCg:
            return "game_cg";
    }
};
