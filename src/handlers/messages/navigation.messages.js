const { SCREENS } = require('../../constants/screens');
const { ITEMS } = require('../../constants/items');
const { SCREEN_FACTORY } = require('../../services/render/renderCotrols');

const setupNavigationHandlers = (bot) => {
  bot.hears('Назад', async (ctx) => {
    if (ctx.session.screen === SCREENS.qualitySelection) {
      ctx.session.screen = SCREENS.typeSelection;
      const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
      renderControls(ctx);
    } else if (ctx.session.screen === SCREENS.sizeSelection) {
      if (ctx.session.type === ITEMS.clothes.name) {
        ctx.session.screen = SCREENS.qualitySelection;
        const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
        renderControls(ctx);
      } else {
        ctx.session.screen = SCREENS.typeSelection;
        const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
        renderControls(ctx);
      }
    } else if (ctx.session.screen === SCREENS.brandSelection) {
      if (
        ctx.session.type === ITEMS.clothes.name ||
        ctx.session.type === ITEMS.shoes.name
      ) {
        ctx.session.screen = SCREENS.sizeSelection;
        const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
        renderControls(ctx);
      } else if (ctx.session.type === ITEMS.accessories.name) {
        ctx.session.screen = SCREENS.qualitySelection;
        const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
        renderControls(ctx);
      }
    }
  });

  bot.hears('Знайти інші речі', async (ctx) => {
    ctx.session.isNew = null;
    ctx.session.type = null;
    ctx.session.size = null;
    ctx.session.brand = null;
    ctx.session.screen = SCREENS.typeSelection;
    ctx.session.postsOffset = 0;

    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx);
  });
};

module.exports = setupNavigationHandlers;
