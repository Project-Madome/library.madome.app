import { enumIter } from "../lib/enumIter";
import * as dto from "../dto";

export const bookKind = (case_: "snake" | "kebab"): string[] => {
    const it = enumIter(dto.BookKind.BookKind);

    switch (case_) {
        case "kebab":
            return it.map(dto.BookKind.toKebabCase) as string[];

        case "snake":
            return it.map(dto.BookKind.toSnakeCase) as string[];

        default:
            throw "unreachable";
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const bookSortBy = (
    _case_: "kebab",
    include?: (keyof typeof dto.BookSortBy.BookSortBy)[],
) =>
    enumIter(dto.BookSortBy.BookSortBy, include).map(
        dto.BookSortBy.toKebabCase,
    );

// export const bookTag = Joi.array().items(Joi.string()).min(2).max(2);
export const bookTagKind = (case_: "kebab" | "snake") => {
    const it = enumIter(dto.BookTagKind.BookTagKind);

    switch (case_) {
        case "kebab":
            return it.map(dto.BookTagKind.toKebabCase);

        case "snake":
            return it.map(dto.BookTagKind.toSnakeCase);

        default:
            throw "unreachable";
    }
};
