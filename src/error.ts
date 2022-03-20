export class PayloadError extends Error {
    constructor(msg: string) {
        super();

        this.message = msg;
        this.name = "Invalid payload";
    }
}

export class NotFoundError extends Error {
    constructor(msg: string) {
        super();

        this.message = msg;
        this.name = "Not found resource";
    }
}

export class InternalError extends Error {
    constructor(msg: string) {
        super();

        this.message = msg;
        this.name = "Internal";
    }
}
