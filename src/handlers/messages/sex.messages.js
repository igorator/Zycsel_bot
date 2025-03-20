const { SEX_EVENT_REGEX } = require('../../constants/regex');

const setupSexHandlers = (bot) => {
  bot.hears(SEX_EVENT_REGEX, async (ctx) => {});
};
