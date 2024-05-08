const {
  SCREENS,
  ITEMS_TYPES,
  CLOTHING_SIZES,
  SHOES_SIZES,
} = require('../components/constants');
const {
  qualityKeyboard,
  typeKeyboard,
  sizesKeyboard,
  brandKeyboard,
  itemsSearchKeyboard,
} = require('../components/keyboards');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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
    sizeButtons = await supabase
      .from('Zycsel-channel-posts-table')
      .select('sizes')
      .eq('type', ITEMS_TYPES.clothes)
      .eq('is-new', ctx.session.isNew);
  } else if (ctx.session.type === ITEMS_TYPES.shoes) {
    sizeButtons = await supabase
      .from('Zycsel-channel-posts-table')
      .select('sizes')
      .eq('type', ITEMS_TYPES.shoes);
  }

  sizeButtons = sizeButtons.data.flatMap((element) =>
    element.sizes.replace(/[{}]/g, '').split(' '),
  );

  if (ctx.session.type === ITEMS_TYPES.clothes) {
    sizeButtons = CLOTHING_SIZES.filter((label) => sizeButtons.includes(label));
  } else if (ctx.session.type === ITEMS_TYPES.shoes) {
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
    brandButtons = await supabase
      .from('Zycsel-channel-posts-table')
      .select('brand')
      .eq('type', ITEMS_TYPES.accessories)
      .eq('is-in-stock', true)
      .eq('is-new', ctx.session.isNew);
  } else if (ctx.session.type === ITEMS_TYPES.clothes) {
    brandButtons = await supabase
      .from('Zycsel-channel-posts-table')
      .select('brand')
      .eq('type', ITEMS_TYPES.clothes)
      .eq('is-in-stock', true)
      .eq('is-new', ctx.session.isNew)
      .textSearch('sizes', `${ctx.session.size}`);
  } else if (ctx.session.type === ITEMS_TYPES.shoes) {
    brandButtons = await supabase
      .from('Zycsel-channel-posts-table')
      .select('brand')
      .eq('type', ITEMS_TYPES.shoes)
      .eq('is-in-stock', true)
      .textSearch('sizes', `${ctx.session.size}`);
  }

  brandButtons = brandButtons.data.map((element) => element.brand);

  brandButtons = brandButtons.flatMap((subArray) => subArray);

  brandButtons = Array.from(new Set(brandButtons));

  brandButtons = brandButtons.sort((a, b) => {
    if (a === 'Stone Island') return -1;
    if (b === 'Stone Island') return 1;
    if (a === 'Cp Company') return -1;
    if (b === 'Cp Company') return 1;
    return a.localeCompare(b);
  });

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
      : `Ви обрали бренд ${ctx.match}`;

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
