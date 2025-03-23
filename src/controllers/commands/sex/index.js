const { setupManSexController } = require('./man');
const { setupUnisexSexController } = require('./unisex');
const { setupWomanSexController } = require('./woman');

const setupSexControllers = (bot) => {
  setupManSexController(bot);
  setupWomanSexController(bot);
  setupUnisexSexController(bot);
};
module.exports = { setupSexControllers };
