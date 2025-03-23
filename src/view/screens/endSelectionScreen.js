const { NAV_BUTTONS } = require('../../constants/keyboards');

const renderItemsEndSelection = async (ctx) => {
  await ctx.reply(
    'Наразі це всі речі за вашим запитом. Оформити замовлення: @zycsel',
    {
      reply_markup: {
        keyboard: [NAV_BUTTONS.backToStart],
        resize_keyboard: true,
      },
    },
  );
};

module.exports = { renderItemsEndSelection };
