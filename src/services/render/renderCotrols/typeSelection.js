const {
  getChannelPostsTypes,
} = require('../../database/channelPosts/getChannelPostsTypes');

const renderTypeSelection = async (ctx) => {
  try {
    const types = await getChannelPostsTypes();

    if (types.length === 0) {
      return await ctx.reply('Немає доступних типів речей.');
    }

    const keyboard = types.map((type) => [type]);

    await ctx.reply('Оберіть тип речей:', {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error in renderTypeSelection:', error);
    await ctx.reply('Виникла помилка при отриманні одягу.');
  }
};

module.exports = { renderTypeSelection };
