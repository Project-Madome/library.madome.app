import "./route/mod";

import * as Koa from "koa";
import * as koaBodyparser from "koa-bodyparser";
import * as koaLogger from "koa-logger";
import { router } from "./route";
import axios from "axios";
import { env } from "./env";

export const server = new Koa();

const authChecker: Koa.Middleware = async (ctx, next) => {
    const isInternal = !ctx.request.headers["x-madome-public-access"];

    if (isInternal) {
        return next();
    }

    const resp = await axios.patch(
        `${env.MADOME_AUTH_URL}/auth/token`,
        {},
        {
            headers: {
                cookie: ctx.request.headers.cookie || "",
            },
            validateStatus: () => true,
        },
    );

    ctx.response.headers = resp.headers;

    if (resp.status === 200) {
        return next();
    }

    ctx.status = resp.status;
    ctx.body = resp.data;
};

server.use(koaLogger());

server.use(authChecker);

server.use(koaBodyparser());

server.use(router.routes()).use(router.allowedMethods());
