const BUTTONS_ICONS = {
  brandsIcon: '\u200C',
};

//screens

const SCREENS = {
  qualitySelection: 'qualitySelection',
  typeSelection: 'typeSelection',
  sizeSelection: 'sizeSelection',
  brandSelection: 'brandSelection',
  itemsSearchSelection: 'itemsSearchSelection',
  searchRefreshSelection: 'searchRefreshSelection',
};

//items types

const ITEMS_TYPES = {
  clothes: 'одяг',
  shoes: 'взуття',
  accessories: 'аксесуари',
};

//sizes

const CLOTHING_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'Джуніор',
  'Жіноче',
];
const SHOES_SIZES = [
  '34',
  '34.5',
  '35',
  '35.5',
  '36',
  '36.5',
  '36',
  '36.5',
  '37',
  '37.5',
  '38',
  '38.5',
  '39',
  '39.5',
  '40',
  '40.5',
  '41',
  '41.5',
  '42',
  '42.5',
  '43',
  '43.5',
  '44',
  '44.5',
  '45',
  '45.5',
  '46',
  '46.5',
  '47',
];

//REGEXP

const SIZE_REGEXP =
  /#розмір_(?:[a-zA-Zа-яА-ЯҐґЄєІіЇїЁёәӘңҮүҖҗҒғҺһӨөҮү]+|\d+(?:_\d+)?)/g;

const BRAND_REGEXP = /#бренд_\w+/;

const BRANDS_EVENT_REGEXP = new RegExp(`[\\p{${BUTTONS_ICONS.brandsIcon}}]`);

module.exports = {
  BUTTONS_ICONS,
  SCREENS,
  ITEMS_TYPES,
  CLOTHING_SIZES,
  SHOES_SIZES,
  SIZE_REGEXP,
  BRAND_REGEXP,
  BRANDS_EVENT_REGEXP,
};
