import { getLogger as gl } from "log4js";

import { env } from "./env";

export function getLogger(label: string) {
    const logger = gl(label);
    logger.level = env.NODE_ENV === "development" ? "trace" : "";
    return logger;
}
