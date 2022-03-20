import * as dotenv from "dotenv";

export interface IEnv extends NodeJS.ProcessEnv {
    MADOME_AUTH_URL: string;
    MADOME_USER_URL: string;
    MADOME_FILE_URL: string;

    POSTGRES_HOST: string;
    POSTGRES_PW: string;
    POSTGRES_USER: string;
    POSTGRES_DB: string;
}

const getEnv = () => {
    dotenv.config();

    return {
        ...process.env,
    } as IEnv;
};

export const env = getEnv();
