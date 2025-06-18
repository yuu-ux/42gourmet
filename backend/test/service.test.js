import { filterOpenStores } from '../services/store.service.js';
import { describe, it, expect } from 'vitest';
import { toZonedTime } from 'date-fns-tz';


describe('filterOpenStores', () => {
    it('営業時間内の店舗のみ返す（昼）', async () => {
        const nowUTC = new Date('2025-06-18T15:00:00+09:00');
        const timeZone = 'Asia/Tokyo';
        const nowJST = toZonedTime(nowUTC, timeZone);
        const now = nowJST;
        const stores = [
            {
                id: 1,
                name: '昼営業中の店',
                store_operation_hours: [
                    {
                        day_of_week: 'Wednesday',
                        open_time: toZonedTime(new Date('1970-01-01T12:00:00+09:00'), timeZone),
                        close_time: toZonedTime(new Date('1970-01-01T16:00:00+09:00'), timeZone),
                    }
                ],
            },
            {
                id: 2,
                name: '営業時間外の店',
                store_operation_hours: [
                    {
                        day_of_week: 'Wednesday',
                        open_time: toZonedTime(new Date('1970-01-01T19:00:00+09:00'), timeZone),
                        close_time: toZonedTime(new Date('1970-01-01T20:00:00+09:00'), timeZone),
                    }
                ],
            },
        ];

        const result = await filterOpenStores(stores, { now });

        expect(result).toEqual([
            {
                id: 1,
                name: '昼営業中の店',
            }
        ]);
    });

    it('前日からの深夜営業に対応しているか', async () => {
        const nowUTC = new Date('2025-06-19T02:00:00+09:00');
        const timeZone = 'Asia/Tokyo';
        const nowJST = toZonedTime(nowUTC, timeZone);
        const now = nowJST;
        const stores = [
            {
                id: 3,
                name: '深夜営業の店',
                store_operation_hours: [
                    {
                        day_of_week: 'Tuesday',
                        open_time: toZonedTime(new Date('1970-01-01T23:00:00+09:00'), timeZone),
                        close_time: toZonedTime(new Date('1970-01-01T03:00:00+09:00'), timeZone),
                    },
                    {
                        day_of_week: 'Wednesday',
                        open_time: toZonedTime(new Date('1970-01-01T23:00:00+09:00'), timeZone),
                        close_time: toZonedTime(new Date('1970-01-01T03:00:00+09:00'), timeZone),
                    },
                ],
            },
        ];

        const result = await filterOpenStores(stores, { now });

        expect(result).toEqual([
            {
                id: 3,
                name: '深夜営業の店',
            }
        ]);
    });

    it('24時間営業の店舗に対応しているか', async () => {
        const nowUTC = new Date('2025-06-18T02:00:00+09:00');
        const timeZone = 'Asia/Tokyo';
        const nowJST = toZonedTime(nowUTC, timeZone);
        const now = nowJST;
        const stores = [
            {
                id: 1,
                name: '24時間営業の店舗',
                store_operation_hours: [
                    {
                        day_of_week: 'Wednesday',
                        open_time: toZonedTime(new Date('1970-01-01T00:00:00+09:00'), timeZone),
                        close_time: toZonedTime(new Date('1970-01-01T00:00:00+09:00'), timeZone),
                    },
                ]
            },
        ];

        const result = await filterOpenStores(stores, { now });

        expect(result).toEqual([
            {
                id: 1,
                name: '24時間営業の店舗',
            }
        ]);
    });
});
