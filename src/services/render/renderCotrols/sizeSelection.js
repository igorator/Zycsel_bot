const { Keyboard } = require('grammy');
const { KEYBOARDS } = require('../../../constants/keyboards');
const {
  getChannelPostsSizes,
} = require('../../database/channelPosts/getChannelPostsSizes');

const renderSizeSelection = async (ctx) => {
  try {
    const sizes = await getChannelPostsSizes(
      ctx.session.type,
      ctx.session.isNew,
    );

    if (!sizes.length) {
      await ctx.reply('Розміри для цього товару не доступні.');
      return;
    }

    console.log(sizes);

    const sizesKeyboard = sizes.map((size) => [Keyboard.text(size)]);

    sizesKeyboard.unshift(KEYBOARDS.back);

    await ctx.reply('Оберіть розмір:', {
      reply_markup: {
        keyboard: sizesKeyboard,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error in renderSizeSelection:', error);
    await ctx.reply('Сталася помилка при отриманні розмірів.');
  }
};

module.exports = { renderSizeSelection };
