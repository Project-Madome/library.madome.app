import { QueryRunner } from "typeorm";

export const transaction = async (
    queryRunner: QueryRunner,
    f: (queryRunner: QueryRunner) => Promise<void>,
): Promise<void> => {
    await queryRunner.startTransaction();

    try {
        await f(queryRunner);

        await queryRunner.commitTransaction();
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
