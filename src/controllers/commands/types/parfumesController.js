const { SCREENS } = require('../../../constants/screens');
const { ITEMS } = require('../../../constants/items');
const { SCREEN_FACTORY } = require('../../../view/screens');
const { TYPE_EVENT_REGEXS } = require('../../../constants/regex');
const { getChannelPostsSex } = require('../../../model');

const setupPafrumesController = (bot) => {
  bot.hears(TYPE_EVENT_REGEXS.parfumes, async (ctx) => {
    ctx.session.type = ITEMS.parfumes.name;
    ctx.session.isNew = true;
    ctx.session.screen = SCREENS.sexSelection;

    const sex = await getChannelPostsSex(ctx.session.type);

    const renderControls = SCREEN_FACTORY[SCREENS.sexSelection];
    renderControls(ctx, sex);
  });
};

module.exports = { setupPafrumesController };
