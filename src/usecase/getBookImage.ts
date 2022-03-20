import * as Joi from "joi";
import axios from "axios";

import { dataSource } from "../database";
import { NotFoundError, PayloadError } from "../error";
import * as entity from "../entity";
import { env } from "../env";
import { Readable } from "stream";

const payload = Joi.object()
    .keys({
        bookId: Joi.number().min(1).required(),
        filename: Joi.string().min(1).required(),
    })
    .required();

export const execute = async (
    bookId: number,
    filename: string,
): Promise<{ status: number; data: Readable }> => {
    const validate = payload.validate({ bookId, filename });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    const book = await dataSource
        .getRepository(entity.Book)
        .findOneBy({ id: bookId });

    if (!book) {
        throw new NotFoundError("Not found book");
    }

    const { status, data } = await axios.get<Readable>(
        `${env.MADOME_FILE_URL}/v1/image/library/${bookId}/${filename}`,
        {
            responseType: "stream",
            validateStatus: () => true,
        },
    );

    return {
        status,
        data,
    };
};

/* axios
    .get<Readable>(`http://192.168.1.21:30001/v1/hello/world.jpg`, {
        responseType: "stream",
        validateStatus: () => true,
    })
    .then((x) => {
        x.data.pipe(fs.createWriteStream("./world.jpg"));
    }); */
