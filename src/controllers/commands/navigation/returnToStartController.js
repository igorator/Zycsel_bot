const { SCREENS } = require('../../../constants');
const { SCREEN_FACTORY } = require('../../../view/screens');
const { getChannelPostsTypes } = require('../../../model');

const setupReturnToStartController = (bot) => {
  bot.hears('Знайти інші речі', async (ctx) => {
    ctx.session.isNew = null;
    ctx.session.type = null;
    ctx.session.size = null;
    ctx.session.brand = null;
    ctx.session.screen = SCREENS.typeSelection;
    ctx.session.postsOffset = 0;
    ctx.session.sex = null;

    const types = await getChannelPostsTypes();

    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx, types);
  });
};

module.exports = { setupReturnToStartController };
