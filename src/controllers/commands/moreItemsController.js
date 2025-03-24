const { getChannelPostsIds } = require('../../model/channelPosts');
const {
  forwardChannelPostsByIds,
} = require('../../view/posts/forwardChannelPostsByIds');

const setupMoreItemsController = (bot) => {
  bot.hears('Завантажити ще', async (ctx) => {
    ctx.session.postsOffset += 10;

    const channelPosts = await getChannelPostsIds(
      ctx.session.type,
      ctx.session.sex,
      ctx.session.isNew,
      ctx.session.size,
      ctx.session.brand,
    );

    await forwardChannelPostsByIds(ctx, channelPosts, ctx.session.postsOffset);
  });
};

module.exports = { setupMoreItemsController };
