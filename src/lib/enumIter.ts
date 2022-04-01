export const enumIter = <T extends object>(
    enum_: T,
    include?: (keyof T)[],
): T[keyof T][] =>
    Object.keys(enum_)
        .filter((x) => Number.isNaN(parseInt(x, 10)))
        .filter((x) =>
            include ? !!include.find((y) => x === y) : true,
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((x) => (enum_ as any)[x]);

/* enum A {
    B,
    C,
    D,
}

console.log(enumIter(A));
console.log(typeof enumIter(A)[0]);

console.log(A.B);

console.log(enumIter(A, ["B"]));
console.log(enumIter(A, ["C"]));
console.log(enumIter(A, ["C", "B"]));

const a = enumIter(A, ["B", "C", "D"]);

a.map((x) => x); */
