import * as dto from "../dto";

export type BookTag = {
    kind: string;
    name: string;
};

export const from = ({
    kind,
    name,
}: dto.BookTag.BookTag): BookTag => ({
    kind,
    name,
});
