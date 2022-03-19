import * as dto from "../dto";

export type BookKind =
    | "doujinshi"
    | "manga"
    | "artist_cg"
    | "game_cg";

export const from = (bookKind: dto.BookKind.BookKind): BookKind => {
    switch (bookKind) {
        case dto.BookKind.BookKind.Doujinshi:
            return "doujinshi";

        case dto.BookKind.BookKind.Manga:
            return "manga";

        case dto.BookKind.BookKind.ArtistCg:
            return "artist_cg";

        case dto.BookKind.BookKind.GameCg:
            return "game_cg";
    }
};
