const { SCREENS } = require('../../constants/screens');
const { ITEMS } = require('../../constants/items');
const { SCREEN_FACTORY } = require('../../services/render/renderCotrols');
const { TYPE_EVENT_REGEXS } = require('../../constants/regex');

const setupTypeHandlers = (bot) => {
  bot.hears(TYPE_EVENT_REGEXS.clothes, async (ctx) => {
    ctx.session.type = ITEMS.clothes.name;
    ctx.session.screen = SCREENS.qualitySelection;
    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx);
  });

  bot.hears(TYPE_EVENT_REGEXS.shoes, async (ctx) => {
    ctx.session.type = ITEMS.shoes.name;
    ctx.session.isNew = true;
    ctx.session.screen = SCREENS.sizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
    renderControls(ctx);
  });

  bot.hears(TYPE_EVENT_REGEXS.accessories, async (ctx) => {
    ctx.session.type = ITEMS.accessories.name;
    ctx.session.screen = SCREENS.qualitySelection;
    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx);
  });

  bot.hears(TYPE_EVENT_REGEXS.parfumes, async (ctx) => {
    ctx.session.type = ITEMS.parfumes.name;
    ctx.session.isNew = true;
    ctx.session.screen = SCREENS.sizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
    renderControls(ctx);
  });
};

module.exports = setupTypeHandlers;
