const { ITEMS } = require('../../constants/items');
const { capitalize } = require('../../helpers/capitalize');
const { typeCounter } = require('../../helpers/types/typeCounter');

const renderTypeSelection = async (ctx, types) => {
  try {
    if (!types || types.length === 0) {
      return await ctx.reply('Немає доступних типів речей.');
    }

    const typeCounts = typeCounter(types, ITEMS);

    const options = [
      {
        label: capitalize(ITEMS.clothes.name),
        count: typeCounts[ITEMS.clothes.name] || 0,
      },
      {
        label: capitalize(ITEMS.shoes.name),
        count: typeCounts[ITEMS.shoes.name] || 0,
      },
      {
        label: capitalize(ITEMS.accessories.name),
        count: typeCounts[ITEMS.accessories.name] || 0,
      },
      {
        label: capitalize(ITEMS.parfumes.name),
        count: typeCounts[ITEMS.parfumes.name] || 0,
      },
    ].filter((option) => option.count > 0);

    if (options.length === 0) {
      return await ctx.reply('Немає доступних типів речей.');
    }

    const keyboard = options.map((option) => [
      `${option.label} (${option.count})`,
    ]);

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
