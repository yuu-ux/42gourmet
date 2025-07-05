export function createMap(options) {
  return options.reduce((acc, option) => {
    acc[option.value] = option.title;
    return acc;
  }, {});
}

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
<<<<<<< HEAD
    { title: '~500', value: 1 },
    { title: '~999', value: 2 },
    { title: '~1500', value: 3 },
    { title: '1501~', value: 4 },
];

export const priceOptionsForRegister = [
    { title: '~500', value: 1 },
    { title: '501~999', value: 2 },
    { title: '1000~1500', value: 3 },
    { title: '1501~', value: 4 },
];

export const genreMap = {
    1: '和食',
    2: '中華',
    3: '洋食',
    4: 'アジアン',
    5: 'カフェ',
    6: '居酒屋',
    7: 'その他',
};

export const reasonMap = {
    1: 'コスパが良い',
    2: '提供が早い',
    3: '味が最高',
    4: '栄養満点',
};

export const priceMap = {
    1: '~500',
    2: '501~999',
    3: '1000~1500',
    4: '1501~',
};
=======
  { title: '~500', value: 1 },
  { title: '~999', value: 2 },
  { title: '~1500', value: 3 },
  { title: '1501~', value: 4 },
];

export const priceMap = createMap(priceOptions);
export const reasonMap = createMap(reasonOptions);
export const genreMap = createMap(genreOptions);
>>>>>>> 11dc39a (MapとOptionsそれぞれ別で定義していた絞り込み要件をOptionsに統合して、MapはOptionsをCreateMapすることで使用するよう変更した)
