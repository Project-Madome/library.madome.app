import { createConnection } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import * as entity from "./entity";
import { env } from "./env";
import { advisoryLock } from "./lib/advisoryLock";
import { getLogger } from "./logger";
import { migrateBooks1647253889140 } from "./migration/1647253889140-migrateBooks";
import { server } from "./server";

// useContainer(Container);

const log = getLogger("main");

async function main() {
    try {
        // await dataSource.initialize();
        const opt: PostgresConnectionOptions = {
            type: "postgres",
            username: env.POSTGRES_USER,
            host: env.POSTGRES_HOST,
            port: env.POSTGRES_PORT
                ? parseInt(env.POSTGRES_PORT, 10)
                : 5432,
            password: env.POSTGRES_PW,
            database: env.POSTGRES_DB,
            synchronize: true,
            logging: true,
            entities: [
                entity.Book,
                entity.BookTag,
                entity.BookTagRef,
                entity.BookTsvector,
            ],

            migrationsRun: false,
            migrations: [migrateBooks1647253889140],
        };

        const conn = await createConnection(opt);

        const x = `${opt.type}://${opt.username}:${opt.password}@${opt.host}:${opt.port}/${opt.database}`;

        await advisoryLock(x, conn, (conn) => {
            return conn.runMigrations();
        });
    } catch (error) {
        log.error(error);
        process.exit(1);
    }

    server.listen(3112);

    server.on("listening", () => {
        log.info("hello world!");
    });

    server.on("error", (error) => {
        log.error(error);
    });

    process.on("SIGTERM", () => {
        server.close(() => {
            log.info("gracefully shutdown the app");
        });
    });
}

main();
