const { setupChannelPostController } = require('./channelMessagesController');
const {
  setupEditedPostController,
} = require('./editedChannelMessagesController');

const setupPostControllers = (bot) => {
  setupChannelPostController(bot);
  setupEditedPostController(bot);
};

module.exports = { setupPostControllers };
