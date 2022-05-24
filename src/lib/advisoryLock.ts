import { Connection } from "typeorm";
import { sleep } from "./sleep";

export async function advisoryLock(
    uniqueKey_: string,
    conn: Connection,
    f: (conn: Connection) => Promise<unknown>,
) {
    const uniqueKey = makeUniqueKey(uniqueKey_);

    try {
        let locked = await lock(uniqueKey, conn);

        if (locked) {
            await f(conn);
        } else if (!locked) {
            while (!locked) {
                locked = await lock(uniqueKey, conn);

                await sleep(1000);
            }
        }
    } finally {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _wasLocked = await unlock(uniqueKey, conn);
    }
}

async function lock(
    uniqueKey: number,
    conn: Connection,
): Promise<boolean> {
    return conn.manager
        .query(`SELECT pg_try_advisory_lock(${uniqueKey}) as locked`)
        .then((x) => x[0].locked);
}

async function unlock(
    uniqueKey: number,
    conn: Connection,
): Promise<boolean> {
    return conn.manager
        .query(
            `SELECT pg_advisory_unlock(${uniqueKey}) as was_locked`,
        )
        .then((x) => x[0].was_locked);
}

function makeUniqueKey(xs: string): number {
    const arr = [];

    for (const x of xs) {
        arr.push(x.charCodeAt(0));
    }

    return arr.reduce((acc, e) => acc + e);
}
