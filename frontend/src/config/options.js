const createMap = (options) => {
    return options.reduce((acc, option) => {
        acc[option.value] = option.title;
        return acc;
    }, {});
};

export const genreOptions = [
    { title: '和食', value: 1 },
    { title: '中華', value: 2 },
    { title: '洋食', value: 3 },
    { title: 'アジアン', value: 4 },
    { title: 'カフェ', value: 5 },
    { title: '居酒屋', value: 6 },
    { title: 'その他', value: 7 },
];

export const reasonOptions = [
    { title: 'コスパが良い', value: 1 },
    { title: '提供が早い', value: 2 },
    { title: '味が最高', value: 3 },
    { title: '栄養満点', value: 4 },
];

export const priceOptions = [
    { title: '~500', value: 1 },
    { title: '~999', value: 2 },
    { title: '~1500', value: 3 },
    { title: '1501~', value: 4 },
];

export const priceMap = createMap(priceOptions);
export const reasonMap = createMap(reasonOptions);
export const genreMap = createMap(genreOptions);
