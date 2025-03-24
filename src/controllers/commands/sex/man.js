const { SCREEN_FACTORY } = require('../../../view/screens');
const { SEX_EVENT_REGEXS } = require('../../../constants/regex');
const { SCREENS } = require('../../../constants/screens');
const { SEX_TYPES } = require('../../../constants/sexTypes');
const { getChannelPostsSizes } = require('../../../model');

const setupManSexController = (bot) => {
  bot.hears(SEX_EVENT_REGEXS.man, async (ctx) => {
    ctx.session.sex = SEX_TYPES.man;
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

module.exports = { setupManSexController };
