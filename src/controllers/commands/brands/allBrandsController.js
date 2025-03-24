const { SCREENS } = require('../../../constants/screens');
const { getChannelPostsIds } = require('../../../model/channelPosts');
const {
  forwardChannelPostsByIds,
} = require('../../../view/posts/forwardChannelPostsByIds');

const allBrandsController = (bot) => {
  bot.hears('Всі бренди', async (ctx) => {
    ctx.session.brand = null;
    ctx.session.screen = SCREENS.itemsMoreSelection;
    await ctx.reply(`Ви обрали всі бренди`);

    const channelPosts = await getChannelPostsIds(
      ctx.session.type,
      ctx.session.sex,
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
};

module.exports = { allBrandsController };
