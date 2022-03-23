import * as Joi from "joi";

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
export const bookSortBy = (_case_: "kebab") =>
    enumIter(dto.BookSortBy.BookSortBy).map(
        dto.BookSortBy.toKebabCase,
    );

export const bookTag = Joi.array().items(Joi.string()).min(2).max(2);
