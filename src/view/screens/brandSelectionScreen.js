const { BUTTONS_ICONS } = require('../../constants/regex');
const { KEYBOARDS, NAV_BUTTONS } = require('../../constants/keyboards');
const { formatBrands } = require('../../helpers/brands/formatBrands');
const { filterCountBrands } = require('../../helpers/brands/filterCountBrands');
const { sortBrands } = require('../../helpers/brands/sortBrands');

const renderBrandSelection = async (ctx, brands) => {
  let formattedBrands = formatBrands(brands);
  let countedBrands = filterCountBrands(formattedBrands);
  let sortedBrands = sortBrands(countedBrands);

  const brandButtons = sortedBrands.map((brand) => [
    BUTTONS_ICONS.brandsIcon + brand,
  ]);

  const brandsKeyboard = [
    NAV_BUTTONS.back,
    KEYBOARDS.allBrands,
    ...brandButtons,
  ];

  await ctx.reply('Оберіть бренд:', {
    reply_markup: {
      keyboard: brandsKeyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

module.exports = { renderBrandSelection };
