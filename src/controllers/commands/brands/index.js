const { allBrandsController } = require('./allBrandsController');
const { brandController } = require('./brandController');

const setupBrandControllers = (bot) => {
  allBrandsController(bot);
  brandController(bot);
};

module.exports = { setupBrandControllers };
