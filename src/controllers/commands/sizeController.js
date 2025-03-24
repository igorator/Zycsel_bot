const { SCREEN_FACTORY } = require('../../view/screens');
const { SIZE_EVENT_REGEX } = require('../../constants/regex');
const { SCREENS } = require('../../constants/screens');
const {
  buttonCountRemove,
} = require('../../helpers/general/buttonCountRemove');

const { getChannelPostsBrands } = require('../../model');

const setupSizeController = (bot) => {
  bot.hears(SIZE_EVENT_REGEX, async (ctx) => {
    const size = buttonCountRemove(ctx.match[0]);
    ctx.session.size = size;
    ctx.session.screen = SCREENS.brandSelection;

    const brands = await getChannelPostsBrands(
      ctx.session.type,
      ctx.session.isNew,
      ctx.session.size,
      ctx.session.sex,
    );

    const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
    renderControls(ctx, brands);
  });
};

module.exports = { setupSizeController };
