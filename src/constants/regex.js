const BUTTONS_ICONS = {
  brandsIcon: '\u200C',
};

const TYPE_EVENT_REGEXS = {
  clothes: /^Одяг \(\d+\)$/,
  shoes: /^Взуття \(\d+\)$/,
  accessories: /^Аксесуари \(\d+\)$/,
  parfumes: /^Парфуми \(\d+\)$/,
};

const QUANTITY_EVENT_REGEXS = {
  new: /^Нові \(\d+\)$/,
  used: /^Вживані \(\d+\)$/,
};

const SEX_REGEX = /#стать_(Чоловіча|Жіноча|Унісекс)/g;

const SEX_EVENT_REGEX = /^(Чоловіча|Жіноча|Унісекс)$/;

const SIZE_REGEX = /#розмір_([^\s]+)/g;

const SIZE_EVENT_REGEX =
  /^(XXS|XS|S|M|L|XL|XXL|XXXL|Джуніор|Жіноче|(?:3[4-9]|4[0-7])(?:\.5)?|На розпив|Повний флакон)(?: \(\d+\))?$/;

const BRAND_REGEX = /#бренд_\w+/;
const BRANDS_EVENT_REGEX = new RegExp(`[\\p{${BUTTONS_ICONS.brandsIcon}}]`);

const COUNT_REMOVE_REGEX = /\s\(\d+\)$/;

module.exports = {
  TYPE_EVENT_REGEXS,
  QUANTITY_EVENT_REGEXS,
  SIZE_REGEX,
  SIZE_EVENT_REGEX,
  BRAND_REGEX,
  BRANDS_EVENT_REGEX,
  BUTTONS_ICONS,
  COUNT_REMOVE_REGEX,
  SEX_REGEX,
  SEX_EVENT_REGEX,
};
