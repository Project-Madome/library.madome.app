export class PayloadError extends Error {
    constructor(msg: string) {
        super();

        this.message = msg;
        this.name = "Invalid Payload";
    }
}

export class NotFoundError extends Error {
    constructor(msg: string) {
        super();

        this.message = msg;
        this.name = "Not Found Resource";
    }
}
