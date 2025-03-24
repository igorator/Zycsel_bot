const { SCREENS } = require('../../../constants/screens');
const { ITEMS } = require('../../../constants/items');
const { SCREEN_FACTORY } = require('../../../view/screens');
const { TYPE_EVENT_REGEXS } = require('../../../constants/regex');
const { getChannelPostsQualities } = require('../../../model');

const setupAccessoriesController = (bot) => {
  bot.hears(TYPE_EVENT_REGEXS.accessories, async (ctx) => {
    ctx.session.type = ITEMS.accessories.name;
    ctx.session.screen = SCREENS.qualitySelection;
    ctx.session.sex = null;

    const qualities = await getChannelPostsQualities(
      ctx.session.type,
      ctx.session.sex,
    );

    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx, qualities);
  });
};

module.exports = { setupAccessoriesController };
