const {
  SCREENS,
  ITEMS_TYPES,
  CLOTHING_SIZES,
  SHOES_SIZES,
  BUTTONS_ICONS,
} = require('../components/constants');
const {
  qualityKeyboard,
  typeKeyboard,
  sizesKeyboard,
  brandKeyboard,
  itemsSearchKeyboard,
} = require('../components/keyboards');
const { getChannelPostsBrands } = require('../database/getChannelPostsBrands');
const { getChannelPostsSizes } = require('../database/getChannelPostsSizes');

const renderTypeControls = async (ctx) => {
  const msgReply = 'Оберіть тип речей';

  await ctx.reply(msgReply, {
    reply_markup: typeKeyboard,
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////

const renderQualityControls = async (ctx) => {
  const msgReply =
    ctx.match === 'Назад'
      ? 'Оберіть стан речей'
      : `Ви обрали ${ctx.match}. Оберіть стан речей.`;

  await ctx.reply(msgReply, {
    reply_markup: qualityKeyboard,
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////

const renderSizeControls = async (ctx) => {
  let sizeButtons;
  if (ctx.session.type === ITEMS_TYPES.clothes) {
    sizeButtons = await getChannelPostsSizes(
      ctx.session.type,
      ctx.session.isNew,
    );

    sizeButtons = CLOTHING_SIZES.filter((label) => sizeButtons.includes(label));
  } else if (ctx.session.type === ITEMS_TYPES.shoes) {
    sizeButtons = await getChannelPostsSizes(ctx.session.type, true);

    sizeButtons = SHOES_SIZES.filter((label) => sizeButtons.includes(label));
  }

  const msgReply =
    ctx.match === 'Назад'
      ? 'Оберіть розмір речей'
      : `Ви обрали ${ctx.match}. Оберіть розмір речей.`;

  await ctx.reply(msgReply, {
    reply_markup: sizesKeyboard(sizeButtons),
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////

const renderBrandControls = async (ctx) => {
  let brandButtons;
  if (ctx.session.type === ITEMS_TYPES.accessories) {
    brandButtons = await getChannelPostsBrands(
      ctx.session.type,
      ctx.session.isNew,
      null,
    );
  } else if (ctx.session.type === ITEMS_TYPES.clothes) {
    brandButtons = await getChannelPostsBrands(
      ctx.session.type,
      ctx.session.isNew,
      ctx.session.size,
    );
  } else if (ctx.session.type === ITEMS_TYPES.shoes) {
    brandButtons = await getChannelPostsBrands(
      ctx.session.type,
      true,
      ctx.session.size,
    );
  }

  brandButtons = brandButtons.map(
    (brand) => `${BUTTONS_ICONS.brandsIcon}${brand}`,
  );

  const msgReply = `Вы обрали ${ctx.match}. Оберіть бренд`;
  await ctx.reply(msgReply, {
    reply_markup: brandKeyboard(brandButtons),
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////

const renderItemsSearchControls = async (ctx) => {
  const msgReply =
    ctx.match === 'Всі бренди'
      ? 'Ви обрали всі бренди'
      : `Ви обрали бренд ${ctx.match.input}`;

  await ctx.reply(msgReply, {
    reply_markup: itemsSearchKeyboard,
  });
};

///////////////////////////////////////////////////////////////////////////////////////////////

const SCREEN_FACTORY = {
  [SCREENS.typeSelection]: renderTypeControls,
  [SCREENS.qualitySelection]: renderQualityControls,
  [SCREENS.sizeSelection]: renderSizeControls,
  [SCREENS.brandSelection]: renderBrandControls,
  [SCREENS.itemsSearchSelection]: renderItemsSearchControls,
};

module.exports = { SCREEN_FACTORY };
