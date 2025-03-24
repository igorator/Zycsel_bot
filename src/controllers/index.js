const { setupPostControllers } = require('./posts');
const { setupCommandControllers } = require('./commands');
const { setupStartController } = require('./startController');

const setupControllers = (bot) => {
  setupStartController(bot);
  setupCommandControllers(bot);
  setupPostControllers(bot);
};

module.exports = { setupControllers };
