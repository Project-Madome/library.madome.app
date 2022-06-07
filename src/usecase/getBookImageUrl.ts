import * as Joi from "joi";

import { NotFoundError, PayloadError } from "../error";
import * as entity from "../entity";
import { env } from "../env";
import { getRepository } from "typeorm";

const payload = Joi.object()
    .keys({
        bookId: Joi.number().min(1).required(),
        filename: Joi.string().min(1).required(),
    })
    .required();

export const execute = async (
    bookId: number,
    filename: string,
): Promise<string> => {
    const validate = payload.validate({ bookId, filename });

    if (validate.error) {
        throw new PayloadError(validate.error.message);
    }

    const book = await getRepository(entity.Book).findOne({
        where: {
            id: bookId,
        },
    });

    if (!book) {
        throw new NotFoundError("Not found book");
    }

    return `${env.MADOME_FILE_URL}/v1/image/library/${bookId}/${filename}?madome-2022=true`;

    /* const { status, data } = await axios.get<Readable>(
        `${env.MADOME_FILE_URL}/v1/image/library/${bookId}/${filename}`,
        {
            responseType: "stream",
            validateStatus: () => true,
        },
    );

    return {
        status,
        data,
    }; */
};

/* axios
    .get<Readable>(`http://192.168.1.21:30001/v1/hello/world.jpg`, {
        responseType: "stream",
        validateStatus: () => true,
    })
    .then((x) => {
        x.data.pipe(fs.createWriteStream("./world.jpg"));
    }); */
