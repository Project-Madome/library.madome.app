import { createConnection } from "typeorm";
import { server } from "./server";

import * as entity from "./entity";
import { env } from "./env";

// useContainer(Container);

async function main() {
    try {
        /* const p =
            process.env.NODE_ENV === 'development'
                ? '../ormconfig.development.json'
                : '../ormconfig.json';
        const ormconfig = (await import(p)) as PostgresConnectionOptions; */

        await createConnection({
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
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

    server.listen(3112);

    server.on("error", (error) => {
        console.error(error);
    });
}

main();
