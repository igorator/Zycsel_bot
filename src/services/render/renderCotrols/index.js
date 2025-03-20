const { SCREENS } = require('../../../constants/screens');
const { renderTypeSelection } = require('./typeSelection');
const { renderQualitySelection } = require('./qualitySelection');
const { renderSizeSelection } = require('./sizeSelection');
const { renderBrandSelection } = require('./brandSelection');
const { renderItemsMoreSelection } = require('./moreSelection');
const { renderItemsEndSelection } = require('./endSelection');

const SCREEN_FACTORY = {
  [SCREENS.typeSelection]: renderTypeSelection,
  [SCREENS.qualitySelection]: renderQualitySelection,
  [SCREENS.sizeSelection]: renderSizeSelection,
  [SCREENS.brandSelection]: renderBrandSelection,
  [SCREENS.itemsMoreSelection]: renderItemsMoreSelection,
  [SCREENS.itemsEndSelection]: renderItemsEndSelection,
};

module.exports = {
  SCREEN_FACTORY,
};
