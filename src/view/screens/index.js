const { SCREENS } = require('../../constants/screens');
const { renderTypeSelection } = require('./typeSelectionScreen');
const { renderQualitySelection } = require('./qualitySelectionScreen');
const { renderSizeSelection } = require('./sizeSelectionScreen');
const { renderBrandSelection } = require('./brandSelectionScreen');
const { renderItemsMoreSelection } = require('./moreItemsSelectionScreen');
const { renderItemsEndSelection } = require('./endSelectionScreen');
const { renderSexSelection } = require('./sexSelectionScreen');

const SCREEN_FACTORY = {
  [SCREENS.typeSelection]: renderTypeSelection,
  [SCREENS.sexSelection]: renderSexSelection,
  [SCREENS.qualitySelection]: renderQualitySelection,
  [SCREENS.sizeSelection]: renderSizeSelection,
  [SCREENS.brandSelection]: renderBrandSelection,
  [SCREENS.itemsMoreSelection]: renderItemsMoreSelection,
  [SCREENS.itemsEndSelection]: renderItemsEndSelection,
};

module.exports = {
  SCREEN_FACTORY,
};
