import { server } from "./server";
import { dataSource } from "./database";

// useContainer(Container);

async function main() {
    try {
        await dataSource.initialize();
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
