const { SCREENS } = require('../../../constants/screens');
const { ITEMS } = require('../../../constants/items');
const { SCREEN_FACTORY } = require('../../../view/screens');
const { TYPE_EVENT_REGEXS } = require('../../../constants/regex');
const { getChannelPostsSizes } = require('../../../model');

const setupShoesController = (bot) => {
  bot.hears(TYPE_EVENT_REGEXS.shoes, async (ctx) => {
    ctx.session.type = ITEMS.shoes.name;
    ctx.session.isNew = true;
    ctx.session.sex = null;
    ctx.session.screen = SCREENS.sizeSelection;

    const sizes = await getChannelPostsSizes(
      ctx.session.type,
      ctx.session.isNew,
      ctx.session.sex,
    );

    const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
    renderControls(ctx, sizes);
  });
};

module.exports = { setupShoesController };
