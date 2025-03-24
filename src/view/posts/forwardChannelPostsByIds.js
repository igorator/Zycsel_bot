const CHANNEL_ID = process.env.CHANNEL_ID;
const { SCREEN_FACTORY } = require('../screens');
const { SCREENS } = require('../../constants/screens');

const forwardChannelPostsByIds = async (ctx, channelPosts, postOffset) => {
  let postCounter = 0;

  for (let i = postOffset; i < channelPosts.length; i++) {
    const messagesIds = channelPosts[i];
    await ctx.api.forwardMessages(ctx.chat.id, CHANNEL_ID, messagesIds);
    postCounter++;

    if (postCounter % 10 === 0) {
      await ctx.reply(
        `Виведено ${i + 1} речей з ${channelPosts.length}. Завантажити ще?`,
      );

      const renderControls = SCREEN_FACTORY[SCREENS.itemsMoreSelection];
      await renderControls(ctx);
      break;
    }
  }

  if (postOffset + postCounter >= channelPosts.length) {
    const renderControls = SCREEN_FACTORY[SCREENS.itemsEndSelection];
    await renderControls(ctx);
  }
};

module.exports = { forwardChannelPostsByIds };
