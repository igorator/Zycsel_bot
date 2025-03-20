const { SCREENS } = require('../../constants/screens');
const { SCREEN_FACTORY } = require('../../services/render/renderCotrols');
const { ITEMS } = require('../../constants/items');
const { QUANTITY_EVENT_REGEXS } = require('../../constants/regex');

const setupQualityHandlers = (bot) => {
  bot.hears(QUANTITY_EVENT_REGEXS.new, async (ctx) => {
    ctx.session.isNew = true;
    if (ctx.session.type === ITEMS.accessories.name) {
      ctx.session.screen = SCREENS.brandSelection;
      const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
      renderControls(ctx);
      return;
    }

    ctx.session.screen = SCREENS.sizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
    renderControls(ctx);
  });

  bot.hears(QUANTITY_EVENT_REGEXS.used, async (ctx) => {
    ctx.session.isNew = false;
    if (ctx.session.type === ITEMS.accessories.name) {
      ctx.session.screen = SCREENS.brandSelection;
      const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
      renderControls(ctx);
      return;
    }
    ctx.session.screen = SCREENS.sizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
    renderControls(ctx);
  });
};

module.exports = setupQualityHandlers;
