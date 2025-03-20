const { NAV_BUTTONS } = require('../../../constants/keyboards');
const {
  getChannelPostsQuality,
} = require('../../database/channelPosts/getChannelPostsQuality');

const renderQualitySelection = async (ctx) => {
  try {
    const qualityCounts = await getChannelPostsQuality(ctx.session.type);

    const keyboard = [
      [`Нові (${qualityCounts.new})`],
      [`Вживані (${qualityCounts.used})`],
      NAV_BUTTONS.back,
    ];

    await ctx.reply('Оберіть стан речей:', {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error in renderQualitySelection:', error);
    await ctx.reply('Виникла помилка при отриманні стану речей.');
  }
};

module.exports = { renderQualitySelection };
