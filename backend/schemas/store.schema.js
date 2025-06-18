export const GENRE_ENUM = [1, 2, 3, 4, 5, 6];
export const PRICE_LEVEL_ENUM = [1, 2, 3, 4];
export const REASON_ENUM = [1, 2, 3, 4];
export const IS_OPEN_ENUM = [0, 1];

export const storeProperties = {
    id: { type: 'integer' },
    name: { type: 'string' },
    address: { type: 'string' },
    price_level: { type: 'integer', enum: PRICE_LEVEL_ENUM },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    genre: { type: 'integer', enum: GENRE_ENUM },
    reason: {
        type: 'array',
        items: {
            type: 'integer',
            enum: REASON_ENUM,
        },
    },
};

export const getStoresSchema = {
    querystring: {
        type: 'object',
        properties: {
            price_level: { type: 'integer', enum: PRICE_LEVEL_ENUM },
            genre: { type: 'integer', enum: GENRE_ENUM },
            reason: { type: 'integer', enum: REASON_ENUM },
            is_open: { type: 'integer', enum: IS_OPEN_ENUM },
        },
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: storeProperties,
            },
        },
    },
};

export const getStoreByIdSchema = {
    tags: ['Stores'],
    description: '指定されたIDのレストラン情報を取得',
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' },
        },
        required: ['id'],
    },
    response: {
        200: {
            type: 'object',
            properties: storeProperties,
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};

export const createStoreSchema = {
    tags: ['Stores'],
    description: '新しいレストランを登録',
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            address: { type: 'string' },
            price_level: { type: 'integer', enum: [1, 2, 3, 4] },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            genre: { type: 'string' },
            reason: { type: 'string' },
            operation_hours: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        day_of_week: {
                            type: 'string',
                            enum: [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ],
                        },
                        open_time: {
                            type: 'string',
                            pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
                        },
                        close_time: {
                            type: 'string',
                            pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
                        },
                    },
                },
            },
        },
        required: ['name'],
    },
    response: {
        201: {
            type: 'object',
            properties: storeProperties,
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};

export const deleteStoreSchema = {
    tags: ['Stores'],
    description: 'レストランを削除',
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' },
        },
        required: ['id'],
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
            },
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};

export const updateStoreSchema = {
    tags: ['Stores'],
    description: 'レストラン情報を更新',
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' },
        },
        required: ['id'],
    },
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            address: { type: 'string' },
            price_level: { type: 'integer', enum: [1, 2, 3, 4] },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            genre: { type: 'string' },
            reason: { type: 'string' },
            operation_hours: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        day_of_week: {
                            type: 'string',
                            enum: [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                                'Sunday',
                            ],
                        },
                        open_time: {
                            type: 'string',
                            pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
                        },
                        close_time: {
                            type: 'string',
                            pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
                        },
                    },
                },
            },
        },
        required: ['name'],
    },
    response: {
        200: {
            type: 'object',
            properties: storeProperties,
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
        404: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
        },
    },
};
