const { setupTypeControllers } = require('./types');
const { setupSexControllers } = require('./sex');
const { setupQualityControllers } = require('./quality');
const { setupSizeController } = require('./sizeController');
const { setupBrandControllers } = require('./brands');
const { setupMoreItemsController } = require('./moreItemsController');
const { setupNavigationControllers } = require('./navigation');

const setupCommandControllers = (bot) => {
  setupTypeControllers(bot);
  setupSexControllers(bot);
  setupQualityControllers(bot);
  setupSizeController(bot);
  setupBrandControllers(bot);
  setupMoreItemsController(bot);
  setupNavigationControllers(bot);
};

module.exports = {
  setupCommandControllers,
};
