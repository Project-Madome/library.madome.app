import * as F from "nodekell";
import { CurriedFunction2 } from "nodekell";
/**
 * - 기준 값이 리스트에서 유일해야 함
 *
 * ```ts
 * syncIndexBy(e => e, [1,2,3,4], [2,3,4,1]) === [1,2,3,4];
 * ```
 */
export interface SyncIndexBy {
    <T, U extends T>(by: (elem: T) => any, original: T[], target: U[]): U[];
    <T, U extends T>(by: (elem: T) => any, original: T[]): (target: U[]) => U[];
    <T, U extends T>(by: (elem: T) => any): CurriedFunction2<T[], U[], U[]>;
}

export const syncIndexBy: SyncIndexBy = F.curry(
    <T, U extends T>(f: (elem: T) => any, original: T[], target: U[]) => {
        const res = [];

        for (const value of target) {
            const x = f(value);
            const index = original.findIndex((e) => f(e) === x);
            res[index] = value;
        }

        return res;
    },
);
