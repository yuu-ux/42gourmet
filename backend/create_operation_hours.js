import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error('API_KEY is not set in environment variables');
    process.exit(1);
}

const getPlaceId = async (Text) => {
    try {
        const res = await fetch(
            'https://places.googleapis.com/v1/places:searchText',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': API_KEY,
                    'X-Goog-FieldMask': 'places.id',
                },
                body: JSON.stringify({ textQuery: Text }),
            }
        );

        const data = await res.json();
        return data.places?.[0]?.id ?? null;
    } catch (err) {
        console.error('エラー', err);
        return null;
    }
};

const getOperateHours = async (placeId) => {
    try {
        const res = await fetch(
            `https://places.googleapis.com/v1/places/${placeId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': API_KEY,
                    'X-Goog-FieldMask': 'regularOpeningHours',
                },
            }
        );

        const data = await res.json();
        return data.regularOpeningHours?.weekdayDescriptions ?? null;
    } catch (err) {
        console.error('エラー', err);
        return null;
    }
};

const stores = [
    '東京都庁',
    '創始麺屋武蔵',
    'カレーハウス CoCo壱番屋 西新宿五丁目駅前通店',
    'もうやんカレー西新宿大忍具店',
    '肉そば家 笑梟（ふくろう）西新宿',
    '松屋 西新宿店',
    'The MEALS アジアンダイニング ザ ミールス 西新宿店',
    'らぁ麺や 嶋',
    '毎日カオマンガイ 新宿店',
    'ひじり屋 西新宿店',
    'あるでん亭 新宿住友ビル店',
    '屋台DELi 小田急第一生命ビル店',
    'しゅぞう',
    '豚山 幡ヶ谷店',
    'Spice Bazaar アチャカナ',
    '馬鹿うま 西新宿本店',
    '中華料理 華盛楼',
    '居酒屋いくなら俺んち来る？宴会部 新宿店',
    'やまと',
    '立呑み晩杯屋 新宿思い出横丁',
    'コーヒーショップ ～Arcobaleno Caffe&Bar Tokyo～',
    '炭火屋 もり平',
    '新時代 新宿西口大ガード店',
    'SpiceCurry FIFTY',
    'KOME TO COFFEE',
    '麺家たいせい',
    '酒膳 穂のほまれ 西新宿店',
    '鶏Dining&Bar Goto',
    '天吉屋 新宿店',
    '天秀',
    '中華そば 流川',
    'MORETHAN BAKERY Shinjuku',
];

const storeHours = {};
(async () => {
    for (const store of stores) {
        const placeId = await getPlaceId(store);
        if (!placeId) continue;

        const operateHours = await getOperateHours(placeId);
        storeHours[store] = operateHours;
    }
    try {
        fs.writeFileSync(
            'store_hours.json',
            JSON.stringify(storeHours, null, 2),
            'utf-8'
        );
        console.log('Successfully wrote store hours to store_hours.json');
    } catch (err) {
        console.error('Failed to write store hours file:', err);
        process.exit(1);
    }
})();
