//screens

const SCREENS = {
  qualitySelection: 'qualitySelection',
  typeSelection: 'typeSelection',
  sizeSelection: 'sizeSelection',
  brandSelection: 'brandSelection',
  itemsSearchSelection: 'itemsSearchSelection',
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
  '40',
  '41',
  '42',
  '42_5',
  '43',
  '43_5',
  '44',
  '44_5',
  '45',
  '45_5',
  '46',
  '47',
];

//REGEXP

const SIZE_REGEXP =
  /#розмір_(?:[a-zA-Zа-яА-ЯҐґЄєІіЇїЁёәӘңҮүҖҗҒғҺһӨөҮү]+|\d+(?:_\d+)?)/g;

const BRAND_REGEXP = /#бренд_\w+/;

module.exports = {
  SCREENS,
  ITEMS_TYPES,
  CLOTHING_SIZES,
  SHOES_SIZES,
  SIZE_REGEXP,
  BRAND_REGEXP,
};
