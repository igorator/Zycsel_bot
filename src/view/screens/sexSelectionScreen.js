const { SEX_TYPES } = require('../../constants/sexTypes');
const { NAV_BUTTONS } = require('../../constants/keyboards');
const { capitalize } = require('../../helpers/capitalize');
const { filterCountSex } = require('../../helpers/sex/filterCountSex');

const renderSexSelection = async (ctx, sex) => {
  try {
    if (!sex || sex.length === 0) {
      return await ctx.reply('Немає доступних розмірів для цієї категорії.');
    }

    const sexCounts = filterCountSex(sex);

    const options = [
      {
        label: capitalize(SEX_TYPES.man),
        count: sexCounts.man,
      },
      {
        label: capitalize(SEX_TYPES.woman),
        count: sexCounts.woman,
      },
      {
        label: capitalize(SEX_TYPES.unisex),
        count: sexCounts.unisex,
      },
    ].filter((option) => option.count > 0);

    if (options.length === 0) {
      return await ctx.reply('Немає доступних категорій за статтю.');
    }

    const keyboard = options.map((option) => [
      `${option.label} (${option.count})`,
    ]);

    const sexSelectionKeyboard = [NAV_BUTTONS.back, ...keyboard];

    await ctx.reply('Оберіть категорію за статтю:', {
      reply_markup: {
        keyboard: sexSelectionKeyboard,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error in renderSexSelection:', error);
    await ctx.reply('Виникла помилка при отриманні категорій за статтю.');
  }
};

module.exports = { renderSexSelection };
