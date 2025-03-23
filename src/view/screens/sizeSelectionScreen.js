const { Keyboard } = require('grammy');
const { NAV_BUTTONS } = require('../../constants/keyboards');
const { ITEMS } = require('../../constants');
const { filterCountSizes } = require('../../helpers/sizes/filterCountSizes');

const renderSizeSelection = async (ctx, sizes) => {
  try {
    if (!sizes || sizes.length === 0) {
      return await ctx.reply('Немає доступних розмірів для цієї категорії.');
    }

    let formattedSizes = sizes.map((item) => item.sizes.trim());

    if (ctx.session.type === ITEMS.clothes.name)
      formattedSizes = filterCountSizes(formattedSizes, ITEMS.clothes.sizes);

    if (ctx.session.type === ITEMS.shoes.name)
      formattedSizes = filterCountSizes(formattedSizes, ITEMS.shoes.sizes);

    if (ctx.session.type === ITEMS.parfumes.name)
      formattedSizes = filterCountSizes(formattedSizes, ITEMS.parfumes.sizes);

    const sizesKeyboard = formattedSizes.map((size) => [Keyboard.text(size)]);

    await ctx.reply('Оберіть розмір:', {
      reply_markup: {
        keyboard: [NAV_BUTTONS.back, ...sizesKeyboard],
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error in renderSizeSelection:', error);
    await ctx.reply('Сталася помилка при отриманні розмірів.');
  }
};

module.exports = { renderSizeSelection };
