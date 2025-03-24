const { SCREENS } = require('../../../constants/screens');
const { SCREEN_FACTORY } = require('../../../view/screens');
const { ITEMS } = require('../../../constants/items');
const { QUALITY_EVENT_REGEXS } = require('../../../constants/regex');
const {
  getChannelPostsBrands,
  getChannelPostsSizes,
} = require('../../../model');

const setupNewQualityController = (bot) => {
  bot.hears(QUALITY_EVENT_REGEXS.new, async (ctx) => {
    ctx.session.isNew = true;

    if (ctx.session.type === ITEMS.accessories.name) {
      ctx.session.screen = SCREENS.brandSelection;

      const brands = await getChannelPostsBrands(
        ctx.session.type,
        ctx.session.isNew,
        ctx.session.size,
        ctx.session.sex,
      );

      const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
      renderControls(ctx, brands);
    } else {
      ctx.session.screen = SCREENS.sizeSelection;

      const sizes = await getChannelPostsSizes(
        ctx.session.type,
        ctx.session.isNew,
        ctx.session.sex,
      );

      const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
      renderControls(ctx, sizes);
    }
  });
};

module.exports = { setupNewQualityController };
