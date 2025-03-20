const { SCREENS } = require('../../constants/screens');
const { BRANDS_EVENT_REGEX, BUTTONS_ICONS } = require('../../constants/regex');
const { getAllChannelPostsIds } = require('../../services/database');
const {
  forwardChannelPostsByIds,
} = require('../../services/forwardChannelPosts');
const {
  handlerCountRemove,
} = require('../../helpers/handlers/handerCountRemove');

const setupBrandHandlers = (bot) => {
  bot.hears('Всі бренди', async (ctx) => {
    ctx.session.brand = null;
    ctx.session.screen = SCREENS.itemsMoreSelection;
    await ctx.reply(`Ви обрали всі бренди`);

    const channelPosts = await getAllChannelPostsIds(
      ctx.session.type,
      ctx.session.isNew,
      ctx.session.size,
      null,
    );

    if (channelPosts.length <= 0) {
      ctx.reply('За вашим запитом ще немає речей');
    } else {
      ctx.reply('Перелік речей за вашим запитом:');
      await forwardChannelPostsByIds(
        ctx,
        channelPosts,
        ctx.session.postsOffset,
      );
    }
  });

  bot.hears(BRANDS_EVENT_REGEX, async (ctx) => {
    ctx.session.brand = handlerCountRemove(
      ctx.match.input.replace(BUTTONS_ICONS.brandsIcon, ''),
    );
    ctx.session.screen = SCREENS.itemsMoreSelection;
    await ctx.reply(`Ви обрали бренд ${ctx.session.brand}`);

    const channelPosts = await getAllChannelPostsIds(
      ctx.session.type,
      ctx.session.isNew,
      ctx.session.size,
      ctx.session.brand,
    );

    if (channelPosts.length <= 0) {
      ctx.reply('За вашим запитом ще немає речей');
    } else {
      ctx.reply('Перелік речей за вашим запитом:');
      await forwardChannelPostsByIds(
        ctx,
        channelPosts,
        ctx.session.postsOffset,
      );
    }
  });
};

module.exports = setupBrandHandlers;
