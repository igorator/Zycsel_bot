const { SCREENS } = require('../../../constants/screens');
const {
  BRAND_EVENT_REGEX,
  BUTTONS_ICONS,
} = require('../../../constants/regex');
const { getChannelPostsIds } = require('../../../model/channelPosts');
const {
  forwardChannelPostsByIds,
} = require('../../../view/posts/forwardChannelPostsByIds');

const {
  buttonCountRemove,
} = require('../../../helpers/general/buttonCountRemove');

const brandController = (bot) => {
  bot.hears(BRAND_EVENT_REGEX, async (ctx) => {
    ctx.session.brand = buttonCountRemove(
      ctx.match.input.replace(BUTTONS_ICONS.brandsIcon, ''),
    );
    ctx.session.screen = SCREENS.itemsMoreSelection;
    await ctx.reply(`Ви обрали бренд ${ctx.session.brand}`);

    const channelPosts = await getChannelPostsIds(
      ctx.session.type,
      ctx.session.sex,
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

module.exports = { brandController };
