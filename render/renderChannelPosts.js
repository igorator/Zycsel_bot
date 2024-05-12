const CHANNEL_ID = process.env.CHANNEL_ID;
const { SCREEN_FACTORY } = require('../render/renderControls');
const { SCREENS } = require('../components/constants');

const renderChannelPosts = async (ctx, channelPosts, postOffset) => {
  let postCounter = 0;
  console.log(channelPosts.length);
  for (let i = postOffset; i < channelPosts.length; i++) {
    const messagesIds = channelPosts[i];
    await ctx.api.forwardMessages(ctx.chat.id, CHANNEL_ID, messagesIds);
    postCounter++;

    if (postCounter % 10 === 0) {
      await ctx.reply(`Виведено ${i + 1} речей з ${channelPosts.length}`);

      const renderControls = SCREEN_FACTORY[SCREENS.itemsSearchSelection];
      await renderControls(ctx);
      break;
    }
  }

  if (postOffset + postCounter >= channelPosts.length) {
    const renderControls = SCREEN_FACTORY[SCREENS.searchRefreshSelection];
    await renderControls(ctx);
  }
};

module.exports = { renderChannelPosts };

module.exports = { renderChannelPosts };
