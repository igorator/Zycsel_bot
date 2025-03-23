const BUTTONS_ICONS = {
  brandsIcon: '\u200C',
};

const SEX_REGEX = /#стать_.+/;
const SIZE_REGEX = /#розмір_([^\s]+)/g;
const BRAND_REGEX = /#бренд_\w+/;

const COUNT_SUFFIX_REGEX = /\(\d+\)$/;

const TYPE_EVENT_REGEXS = {
  clothes: new RegExp(`^Одяг ${COUNT_SUFFIX_REGEX.source}`),
  shoes: new RegExp(`^Взуття ${COUNT_SUFFIX_REGEX.source}`),
  accessories: new RegExp(`^Аксесуари ${COUNT_SUFFIX_REGEX.source}`),
  parfumes: new RegExp(`^Парфуми ${COUNT_SUFFIX_REGEX.source}`),
};

const QUALITY_EVENT_REGEXS = {
  new: new RegExp(`^Нові ${COUNT_SUFFIX_REGEX.source}`),
  used: new RegExp(`^Вживані ${COUNT_SUFFIX_REGEX.source}`),
};

const SEX_EVENT_REGEXS = {
  man: new RegExp(`^Чоловічі ${COUNT_SUFFIX_REGEX.source}`),
  woman: new RegExp(`^Жіночі ${COUNT_SUFFIX_REGEX.source}`),
  unisex: new RegExp(`^Унісекс ${COUNT_SUFFIX_REGEX.source}`),
};

const SIZE_EVENT_REGEX = new RegExp(
  `^(XXS|XS|S|M|L|XL|XXL|XXXL|Джуніор|Жіноче|(?:3[4-9]|4[0-7])(?:\\.5)?|На розпив|Повний флакон)(?: ${COUNT_SUFFIX_REGEX.source})?`,
);

const BRAND_EVENT_REGEX = new RegExp(`[${BUTTONS_ICONS.brandsIcon}]`, 'u');

const COUNT_REMOVE_REGEX = new RegExp(`\\s${COUNT_SUFFIX_REGEX.source}`);

module.exports = {
  TYPE_EVENT_REGEXS,
  QUALITY_EVENT_REGEXS,
  SIZE_REGEX,
  SIZE_EVENT_REGEX,
  BRAND_REGEX,
  BRAND_EVENT_REGEX,
  BUTTONS_ICONS,
  COUNT_REMOVE_REGEX,
  COUNT_SUFFIX_REGEX,
  SEX_REGEX,
  SEX_EVENT_REGEXS,
};
