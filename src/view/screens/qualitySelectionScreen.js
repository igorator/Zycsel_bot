const { NAV_BUTTONS } = require('../../constants/keyboards');
const { QUALITY_TYPES } = require('../../constants/qualityTypes');
const {
  filterCountQualities,
} = require('../../helpers/qualities/filterCountQualities');
const { capitalize } = require('../../helpers/capitalize');

const renderQualitySelection = async (ctx, qualities) => {
  try {
    if (!qualities || qualities.length === 0) {
      return await ctx.reply('Немає доступних станів для цієї категорії.');
    }

    const filterCountedQualities = filterCountQualities(qualities);

    const options = [
      {
        label: capitalize(QUALITY_TYPES.new),
        count: filterCountedQualities.new,
      },
      {
        label: capitalize(QUALITY_TYPES.used),
        count: filterCountedQualities.used,
      },
    ].filter((option) => option.count > 0);

    const keyboard = options.map((option) => [
      `${option.label} (${option.count})`,
    ]);

    const qualitiesKeyboard = [NAV_BUTTONS.back, ...keyboard];

    await ctx.reply('Оберіть стан речей:', {
      reply_markup: {
        keyboard: qualitiesKeyboard,
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error in renderQualitySelection:', error);
    await ctx.reply('Виникла помилка при отриманні стану речей.');
  }
};

module.exports = { renderQualitySelection };
