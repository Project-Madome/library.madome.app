import * as Joi from "joi";

import { enumIter } from "../lib/enumIter";
import * as dto from "../dto";

export const bookKind = (case_: "snake" | "kebab") =>
    enumIter(dto.BookKind.BookKind).map(
        case_ === "snake"
            ? dto.BookKind.toSnakeCase
            : dto.BookKind.toKebabCase,
    );

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const bookSortBy = (_case_: "kebab") =>
    enumIter(dto.BookSortBy.BookSortBy).map(
        dto.BookSortBy.toKebabCase,
    );
