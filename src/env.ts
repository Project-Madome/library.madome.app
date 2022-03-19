import * as dotenv from "dotenv";

export interface IEnv extends NodeJS.ProcessEnv {
    /* AWS_CLOUDFRONT_PUBLIC_KEY: string;
    AWS_CLOUDFRONT_PRIVATE_KEY: string;
    AWS_CLOUDFRONT_ACCESS_ID: string;
    AWS_CLOUDFRONT_URL: string; */
    // BUCKET_NAME: string;
    MADOME_AUTH_URL: string;
}

const getEnv = () => {
    dotenv.config();

    /* const cloudFrontPublicKey = fs.readFileSync(
        process.env.AWS_CLOUDFRONT_PUBLIC_KEY!,
        { encoding: 'utf8' },
    );
    const cloudFrontPrivateKey = fs.readFileSync(
        process.env.AWS_CLOUDFRONT_PRIVATE_KEY!,
        { encoding: 'utf8' },
    ); */

    return {
        ...process.env,
        // AWS_CLOUDFRONT_PUBLIC_KEY: cloudFrontPublicKey,
        // AWS_CLOUDFRONT_PRIVATE_KEY: cloudFrontPrivateKey,
    } as IEnv;
};

export const env = getEnv();
