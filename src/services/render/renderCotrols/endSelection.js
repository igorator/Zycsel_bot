const { KEYBOARDS } = require('../../../constants/keyboards');

const renderItemsEndSelection = async (ctx) => {
  await ctx.reply(
    'Наразі це всі речі за вашим запитом. Оформити замовлення: @zycsel',
    {
      reply_markup: {
        keyboard: KEYBOARDS.itemsEndSelection,
        resize_keyboard: true,
      },
    },
  );
};

module.exports = { renderItemsEndSelection };
