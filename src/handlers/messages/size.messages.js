const { SIZE_EVENT_REGEX } = require('../../constants/regex');
const { SCREENS } = require('../../constants/screens');
const {
  handlerCountRemove,
} = require('../../helpers/handlers/handerCountRemove');
const { SCREEN_FACTORY } = require('../../services/render/renderCotrols');

const setupSizeHandlers = (bot) => {
  bot.hears(SIZE_EVENT_REGEX, async (ctx) => {
    const size = handlerCountRemove(ctx.match[0]);
    ctx.session.size = size;
    ctx.session.screen = SCREENS.brandSelection;

    const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
    renderControls(ctx);
  });
};

module.exports = setupSizeHandlers;
