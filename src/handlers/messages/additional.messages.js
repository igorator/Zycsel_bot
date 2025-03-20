const { getAllChannelPostsIds } = require('../../services/database');
const {
  forwardChannelPostsByIds,
} = require('../../services/forwardChannelPosts');

const setupAdditionalHandlers = (bot) => {
  bot.hears('Завантажити ще', async (ctx) => {
    ctx.session.postsOffset += 10;

    const channelPosts = await getAllChannelPostsIds(
      ctx.session.type,
      ctx.session.isNew,
      ctx.session.size,
      ctx.session.brand,
    );

    await forwardChannelPostsByIds(ctx, channelPosts, ctx.session.postsOffset);
  });
};

module.exports = setupAdditionalHandlers;
