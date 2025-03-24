const { setupAccessoriesController } = require('./accessoriesController');
const { setupClothesController } = require('./clothesController');
const { setupPafrumesController } = require('./parfumesController');
const { setupShoesController } = require('./shoesController');

const setupTypeControllers = (bot) => {
  setupClothesController(bot);
  setupShoesController(bot);
  setupAccessoriesController(bot);
  setupPafrumesController(bot);
};

module.exports = { setupTypeControllers };
