import { findStores } from '../repositories/store.repository.js';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';

vi.mock('../db/mysql.js', () => ({
    prisma: {
        stores: {
            findMany: vi.fn(),
        },
    },
}));
import { prisma } from '../db/mysql.js';

describe('findStores', () => {
    it('filters: genre=1, price_level=2, reason=[1,2]', async () => {
        await findStores({ genre: 1, price_level: 2, reason: [1, 2] });

        expect(prisma.stores.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    genre: 1,
                    price_level: 2,
                    reason: { array_contains: [1, 2] },
                },
            })
        );
    });

    it('filters: genre=undefined => skipされる', async () => {
        await findStores({ genre: undefined, price_level: 2, reason: [1, 2] });

        expect(prisma.stores.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    genre: Prisma.skip,
                    price_level: 2,
                    reason: { array_contains: [1, 2] },
                },
            })
        );
    });

    it('filters: price_level=null => skipされる', async () => {
        await findStores({ genre: 1, price_level: null, reason: [1, 2] });

        expect(prisma.stores.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    genre: 1,
                    price_level: Prisma.skip,
                    reason: { array_contains: [1, 2] },
                },
            })
        );
    });

    it('filters: reason=undefined => skipされる', async () => {
        await findStores({ genre: 1, price_level: 2, reason: undefined });

        expect(prisma.stores.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    genre: 1,
                    price_level: 2,
                    reason: { array_contains: Prisma.skip },
                },
            })
        );
    });

    it('filters: 全部undefined => 全部skip', async () => {
        await findStores({});

        expect(prisma.stores.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    genre: Prisma.skip,
                    price_level: Prisma.skip,
                    reason: { array_contains: Prisma.skip },
                },
            })
        );
    });
});
