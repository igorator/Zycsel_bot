const { BUTTONS_ICONS } = require('../../../constants/regex');
const { KEYBOARDS } = require('../../../constants/keyboards');
const { getChannelPostsBrands } = require('../../database');

const renderBrandSelection = async (ctx) => {
  const brands = await getChannelPostsBrands(
    ctx.session.type,
    ctx.session.isNew,
    ctx.session.size,
  );

  const brandButtons = brands.map((brand) => [
    BUTTONS_ICONS.brandsIcon + brand,
  ]);

  await ctx.reply('Оберіть бренд:', {
    reply_markup: {
      keyboard: [KEYBOARDS.back, KEYBOARDS.allBrands, ...brandButtons],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

module.exports = { renderBrandSelection };
