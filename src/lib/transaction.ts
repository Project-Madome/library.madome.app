import { QueryRunner } from "typeorm";

export const transaction = (
    queryRunner: QueryRunner,
    f: () => any,
): Promise<void> =>
    new Promise(async (resolve, reject) => {
        await queryRunner.startTransaction();

        try {
            await f();

            await queryRunner.commitTransaction();
            resolve();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            reject(error);
        } finally {
            await queryRunner.release();
        }
    });
