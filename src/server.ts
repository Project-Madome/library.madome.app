import "./route/mod";

import * as Koa from "koa";
import * as koaBodyparser from "koa-bodyparser";
import * as koaLogger from "koa-logger";
import { router } from "./route";
import axios from "axios";
import { env } from "./env";
/* 
import { addBook } from './method/addBook';
import { deleteBook } from './method/deleteBook';
import { getBook } from './method/getBook';
import { getBookImageList } from './method/getBookImageList';
import { getBookImageURL } from './method/getBookImageURL';
import { getBooks } from './method/getBooks';
import { getBooksByIDs } from './method/getBooksByIDs';
import { getBooksCount } from './method/getBooksCount';
import { searchBooks } from './method/searchBooks';
import { searchBooksQueryComplete } from './method/searchBooksQueryComplete';
import { getBooksByMetadata } from './method/getBooksByMetadata';
import { getBooksByRandom } from './method/getBooksByRandom'; */
// import * as toJSON from 'mali-tojson';

export const server = new Koa();

/* const cookieParser = (x: string) => {
    const ret: { [key: string]: string | undefined } = {};

    // a=b; b=c
    const a = x.split(';');

    for (const e of a) {
        const ee = e.split('=');

        const key = ee.at(0) as string;
        const value = ee.at(1);

        ret[key] = value;
    }

    return ret;
}; */

const authChecker: Koa.Middleware = async (ctx, next) => {
    // const cookie = cookieParser(ctx.request.headers['cookie'] || '');

    /* const accessToken = cookie.madome_access_token;
    const refreshToken = cookie.madome_refresh_token; */

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

/* server.use({
    addBook,
    deleteBook,
    getBook,
    getBookImageList,
    getBookImageUrl: getBookImageURL,
    getBooks,
    getBooksByMetadata,
    getBooksByRandom,
    getBooksByIDs,
    getBooksCount,
    searchBooks,
    searchBooksQueryComplete,
}); */
