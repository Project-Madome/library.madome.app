import "./route/mod";

import * as http from "http";

import * as Koa from "koa";
import * as koaBodyparser from "koa-bodyparser";
import * as koaLogger from "koa-logger";
import { router } from "./route";
import axios from "axios";
import { env } from "./env";

const app = new Koa();
export const server = http.createServer(app.callback());

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

app.use(koaLogger());

app.use(authChecker);

app.use(koaBodyparser());

app.use(router.routes()).use(router.allowedMethods());
