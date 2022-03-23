import { Context } from "koa";
import {
    AlreadyExistsError,
    InternalError,
    NotFoundError,
    PayloadError,
} from "../../error";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const catcher = (error: any, ctx: Context) => {
    let status = 500;
    let body: { name: string; message: string } = {
        name: "Unknown error",
        message: "",
    };

    if (error instanceof PayloadError) {
        status = 400;
        body = {
            name: error.name,
            message: error.message,
        };
    } else if (error instanceof NotFoundError) {
        status = 404;
        body = {
            name: error.name,
            message: error.message,
        };
    } else if (error instanceof AlreadyExistsError) {
        status = 409;
        body = {
            name: error.name,
            message: error.message,
        };
    } else if (error instanceof InternalError) {
        status = 500;
        body = {
            name: error.name,
            message: error.message,
        };
    } else {
        if (error.name) {
            body.name = error.name;
        }

        if (error.message) {
            body.message = error.message;
        }
    }

    ctx.status = status;
    ctx.body = body;
};
