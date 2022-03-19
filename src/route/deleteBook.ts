/* import * as grpc from '@grpc/grpc-js';
import { getRepository, getConnection } from 'typeorm';

import Book from '../entity/Book';
import BookMetadata from '../entity/BookMetadata';
import BookTsvector from '../entity/BookTsvector';
import { transaction } from '../lib/transaction';
import { Context } from 'mali';
import { createGRPCError } from 'grpc-create-error';
import { STATUS_CODES } from 'http';
import { ParseResponseType, ILibraryMethods } from '@madome/services';
import { router } from '.';

export const deleteBook = router.delete('/v1/book', async (ctx) => {
    const { id } = ctx.request.body;

    const bookRepo = getRepository(Book);

    const findedBook = await bookRepo.findOne({ id });

    if (!findedBook) {
        const err = createGRPCError(STATUS_CODES[404]!, grpc.status.NOT_FOUND);
        ctx.res = err;
        return;
    }

    const queryRunner = getConnection().createQueryRunner();

    await transaction(queryRunner, async () => {
        await Promise.all([
            queryRunner.manager.delete(BookTsvector, { id }),
            queryRunner.manager.delete(BookMetadata, { fk_book_id: id }),
        ]);
        await queryRunner.manager.delete(Book, { id });
    });

    // addBook에서도 트랜잭션 처리 해주고
    // 트랜잭션 함수가 맞는 건지 천천히 검증해보자

    const res: ParseResponseType<ILibraryMethods['deleteBook']> = {};

    ctx.res = res;
});
 */
