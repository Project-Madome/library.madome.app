import * as entity from "../entity";

export type BookTag = {
    kind: string;
    name: string;
};

export const fromEntity = async (
    r: entity.BookTagRef | entity.BookTag,
): Promise<BookTag> => {
    if (r instanceof entity.BookTagRef) {
        const { kind, name } = await r.tag.get();
        return {
            kind,
            name,
        };
    }

    if (r instanceof entity.BookTag) {
        const { kind, name } = r;
        return {
            kind,
            name,
        };
    }

    throw "unreachable";
};
