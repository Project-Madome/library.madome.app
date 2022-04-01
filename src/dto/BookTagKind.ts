import { enumIter } from "../lib/enumIter";

export enum BookTagKind {
    Artist,
    Group,
    Series,
    Character,
    Female,
    Male,
    Misc,
}

export const toSnakeCase = (x: BookTagKind) => {
    switch (x) {
        case BookTagKind.Artist:
            return "artist";

        case BookTagKind.Group:
            return "group";

        case BookTagKind.Series:
            return "series";

        case BookTagKind.Character:
            return "character";

        case BookTagKind.Female:
            return "female";

        case BookTagKind.Male:
            return "male";

        case BookTagKind.Misc:
            return "misc";
    }
};

export const toKebabCase = (x: BookTagKind) => {
    switch (x) {
        case BookTagKind.Artist:
            return "artist";

        case BookTagKind.Group:
            return "group";

        case BookTagKind.Series:
            return "series";

        case BookTagKind.Character:
            return "character";

        case BookTagKind.Female:
            return "female";

        case BookTagKind.Male:
            return "male";

        case BookTagKind.Misc:
            return "misc";
    }
};

const iter = enumIter(BookTagKind);

export const includes = (x: string, case_: "kebab" | "snake") => {
    let xs: string[] = [];

    switch (case_) {
        case "kebab":
            xs = iter.map(toKebabCase);
            break;

        case "snake":
            xs = iter.map(toSnakeCase);
            break;
    }

    return xs.includes(x);
};

/* console.log(includes("femal", "kebab"));
console.log(includes("female", "kebab"));
console.log(includes("character", "kebab")); */
