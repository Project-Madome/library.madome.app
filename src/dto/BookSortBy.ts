export enum BookSortBy {
    IdAsc,
    IdDesc,
    Random,
    RankAsc,
    RankDesc,
}

export const fromKebabCase = (x: string): BookSortBy | null => {
    switch (x) {
        case "id-asc":
            return BookSortBy.IdAsc;

        case "id-desc":
            return BookSortBy.IdDesc;

        case "random":
            return BookSortBy.Random;

        default:
            return null;
    }
};

export const toKebabCase = (
    sortBy: BookSortBy | null,
): string | null => {
    switch (sortBy) {
        case BookSortBy.IdAsc:
            return "id-asc";

        case BookSortBy.IdDesc:
            return "id-desc";

        case BookSortBy.Random:
            return "random";

        case BookSortBy.RankAsc:
            return "rank-asc";

        case BookSortBy.RankDesc:
            return "rank-desc";

        default:
            return sortBy;
    }
};

export const toSort = (
    sortBy: BookSortBy,
    alias?: string,
): string => {
    switch (sortBy) {
        case BookSortBy.IdAsc:
        case BookSortBy.IdDesc:
            return alias ? alias + "." + "id" : "id";

        case BookSortBy.Random:
            return "RANDOM()";

        case BookSortBy.RankAsc:
        case BookSortBy.RankDesc:
            return alias ? alias + "." + "rank" : "rank";
    }
};

export const toOrder = (sortBy: BookSortBy): "ASC" | "DESC" => {
    switch (sortBy) {
        case BookSortBy.IdAsc:
            return "ASC";

        case BookSortBy.IdDesc:
            return "DESC";

        case BookSortBy.Random:
            return "ASC";

        case BookSortBy.RankAsc:
            return "ASC";

        case BookSortBy.RankDesc:
            return "DESC";
    }
};

export const isRandom = (sortBy: BookSortBy): boolean => {
    switch (sortBy) {
        case BookSortBy.Random:
            return true;
        default:
            return false;
    }
};

export const is = (sortBy: BookSortBy, is: BookSortBy[]): boolean =>
    !!is.find((x) => x === sortBy);
