const { KEYBOARDS } = require('../../../constants/keyboards');

const renderItemsMoreSelection = async (ctx) => {
  await ctx.reply('Оберіть дію:', {
    reply_markup: {
      keyboard: KEYBOARDS.itemsMoreSelection,
      resize_keyboard: true,
    },
  });
};

module.exports = { renderItemsMoreSelection };
