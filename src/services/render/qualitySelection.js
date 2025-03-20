const { KEYBOARDS } = require('../../constants/keyboards');
const {
  getChannelPostsQuality,
} = require('../database/channelPosts/getChannelPostsQuality');

const renderQualitySelection = async (ctx) => {
  const qualityCounts = await getChannelPostsQuality(ctx.session.type);

  const qualityButtons = [
    [`Нові (${qualityCounts.new})`],
    [`Вживані (${qualityCounts.used})`],
    KEYBOARDS.back,
  ];

  await ctx.reply('Оберіть стан речей:', {
    reply_markup: {
      keyboard: qualityButtons,
      resize_keyboard: true,
    },
  });
};

module.exports = { renderQualitySelection };
