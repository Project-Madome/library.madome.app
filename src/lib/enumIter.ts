export const enumIter = <T extends object>(enum_: T): T[keyof T][] =>
    Object.keys(enum_)
        .filter((x) => Number.isNaN(parseInt(x, 10)))
        .map((x) => (enum_ as any)[x]);

/* enum A {
    B,
    C,
    D,
}

console.log(enumIter(A));
console.log(typeof enumIter(A)[0]);

const a = enumIter(A);

a.map((x) => x); */
