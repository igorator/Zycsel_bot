const { SCREENS } = require('../../../constants/screens');
const { ITEMS } = require('../../../constants/items');
const { SCREEN_FACTORY } = require('../../../view/screens');
const {
  getChannelPostsTypes,
  getChannelPostsQualities,
  getChannelPostsSizes,
  getChannelPostsSex,
} = require('../../../model');

const routes = {
  [SCREENS.qualitySelection]: async (session) => {
    session.screen = SCREENS.typeSelection;
    return {
      screen: SCREENS.typeSelection,
      data: await getChannelPostsTypes(),
    };
  },

  [SCREENS.sizeSelection]: async (session) => {
    if (session.type === ITEMS.clothes.name) {
      session.screen = SCREENS.qualitySelection;
      return {
        screen: SCREENS.qualitySelection,
        data: await getChannelPostsQualities(session.type, session.sex),
      };
    }

    if (session.type === ITEMS.parfumes.name) {
      session.screen === SCREENS.sexSelection;
      return {
        screen: SCREENS.sexSelection,
        data: await getChannelPostsSex(session.type),
      };
    }

    session.screen = SCREENS.typeSelection;
    return {
      screen: SCREENS.typeSelection,
      data: await getChannelPostsTypes(),
    };
  },

  [SCREENS.brandSelection]: async (session) => {
    if ([ITEMS.clothes.name, ITEMS.shoes.name].includes(session.type)) {
      session.screen = SCREENS.sizeSelection;
      return {
        screen: SCREENS.sizeSelection,
        data: await getChannelPostsSizes(
          session.type,
          session.isNew,
          session.sex,
        ),
      };
    }
    if (session.type === ITEMS.accessories.name) {
      session.screen = SCREENS.qualitySelection;
      return {
        screen: SCREENS.qualitySelection,
        data: await getChannelPostsQualities(session.type, session.sex),
      };
    }
  },

  [SCREENS.sexSelection]: async (session) => {
    session.screen = SCREENS.typeSelection;
    return {
      screen: SCREENS.typeSelection,
      data: await getChannelPostsTypes(),
    };
  },
};

const setupReturnBackController = (bot) => {
  bot.hears('Назад', async (ctx) => {
    const handler = routes[ctx.session.screen];
    if (handler) {
      const result = await handler(ctx.session);
      if (result) {
        SCREEN_FACTORY[result.screen](ctx, result.data);
      }
    }
  });
};

module.exports = { setupReturnBackController };
