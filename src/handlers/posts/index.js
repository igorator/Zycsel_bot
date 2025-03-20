const setupChannelPostHandler = require('./channel.messages');
const setupEditedPostHandler = require('./edited.messages');

const setupPostHandlers = (bot) => {
  setupChannelPostHandler(bot);
  setupEditedPostHandler(bot);
};

module.exports = setupPostHandlers;
