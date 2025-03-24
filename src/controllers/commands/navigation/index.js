const { setupReturnBackController } = require('./returnBackController');
const { setupReturnToStartController } = require('./returnToStartController');

const setupNavigationControllers = (bot) => {
  setupReturnToStartController(bot);
  setupReturnBackController(bot);
};

module.exports = { setupNavigationControllers };
