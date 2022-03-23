export const isNull = (x: unknown): x is null => {
    return x === null;
};

export const isUndeinfed = (x: unknown): x is undefined => {
    return x === undefined;
};

export const isNullOrUndefined = (
    x: unknown,
): x is null | undefined => {
    return isNull(x) || isUndeinfed(x);
};
