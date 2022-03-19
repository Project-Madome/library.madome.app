export enum BookSortBy {
    IdAsc,
    IdDesc,
    Random,
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

export const toKebabCase = (sortBy: BookSortBy): string => {
    switch (sortBy) {
        case BookSortBy.IdAsc:
            return "id-asc";

        case BookSortBy.IdDesc:
            return "id-desc";

        case BookSortBy.Random:
            return "random";
    }
};

export const toSort = (
    sortBy: BookSortBy,
    alias = "Book",
): string => {
    switch (sortBy) {
        case BookSortBy.IdAsc:
        case BookSortBy.IdDesc:
            return alias + "." + "id";

        case BookSortBy.Random:
            return "RANDOM()";
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
