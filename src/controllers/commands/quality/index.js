const { setupNewQualityController } = require('./newQualityController');
const { setupUsedQualityController } = require('./usedQualityController');

const setupQualityControllers = (bot) => {
  setupNewQualityController(bot);
  setupUsedQualityController(bot);
};

module.exports = { setupQualityControllers };
