require('dotenv').config();
const moment = require('moment');
const { getAllChannelPosts } = require('./database/getAllChannelPosts');
const { renderChannelPosts } = require('./render/renderChannelPosts');
const { upsertMessage } = require('./database/upsertMessage');
const { autoRetry } = require('@grammyjs/auto-retry');
const { limit } = require('@grammyjs/ratelimiter');
const { apiThrottler } = require('@grammyjs/transformer-throttler');
const { run, sequentialize } = require('@grammyjs/runner');
const { Bot, GrammyError, HttpError, session } = require('grammy');
const { SCREEN_FACTORY } = require('./render/renderControls');
const {
  SCREENS,
  ITEMS_TYPES,
  CLOTHING_SIZES,
  SHOES_SIZES,
  SIZE_REGEXP,
  BRAND_REGEXP,
  BRANDS_EVENT_REGEXP,
  BUTTONS_ICONS,
} = require('./components/constants');

const BOT_AUTH_TOKEN = process.env.BOT_AUTH_TOKEN;
if (!BOT_AUTH_TOKEN) throw new Error('BOT_TOKEN не встановлено');

const bot = new Bot(BOT_AUTH_TOKEN);

bot.catch((err) => {
  const errorContext = err.ctx;
  console.error(`Помилка ${errorContext.update.update_id}`);
  const error = err.error;

  if (error instanceof GrammyError) {
    console.error('Помилка в запиті:', error.description);
  } else if (error instanceof HttpError) {
    console.error('Відсутнє підключення до Telegram:', error);
  } else {
    console.error('Unknown error:', error);
  }
});

function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

bot.use(
  session({
    initial: () => ({
      screen: null,
      isNew: null,
      size: null,
      brand: null,
      type: ITEMS_TYPES.clothes,
      postsOffset: 0,
    }),
  }),
);

bot.use(sequentialize(getSessionKey));

const throttler = apiThrottler({
  global: {
    maxConcurrent: 10,
    minTime: 500,
  },
});

bot.api.config.use(autoRetry());
bot.use(limit());
bot.api.config.use(throttler);

bot.api.setMyCommands([{ command: 'start', description: 'Розпочати пошук' }]);

bot.command('start', async (ctx) => {
  ctx.session.screen = SCREENS.typeSelection;
  await ctx.reply(
    'Привіт, на звʼязку бот Zycsel_store🦖 Тут ви можете переглянути всю наявність по брендам/розмірам тощо.',
    {
      reply_to_message_id: ctx.msg.message_id,
    },
  );

  const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
  renderControls(ctx);
});

///////////////////////////////////////////////////////////////////////////////////////////////

bot.hears('Одяг', async (ctx) => {
  ctx.session.type = ITEMS_TYPES.clothes;
  ctx.session.screen = SCREENS.qualitySelection;
  const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
  renderControls(ctx);
});

bot.hears('Взуття', async (ctx) => {
  ctx.session.type = ITEMS_TYPES.shoes;
  ctx.session.isNew = true;
  ctx.session.screen = SCREENS.sizeSelection;
  const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
  renderControls(ctx);
});

bot.hears('Аксесуари', async (ctx) => {
  ctx.session.type = ITEMS_TYPES.accessories;
  ctx.session.size = null;
  ctx.session.screen = SCREENS.qualitySelection;
  const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
  renderControls(ctx);
});
///////////////////////////////////////////////////////////////////////////////////////////////

bot.hears('Нові', async (ctx) => {
  ctx.session.isNew = true;
  if (ctx.session.type === ITEMS_TYPES.accessories) {
    ctx.session.screen = SCREENS.brandSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
    renderControls(ctx);
    return;
  }

  ctx.session.screen = SCREENS.sizeSelection;
  const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
  renderControls(ctx);
});

bot.hears('Вживані', async (ctx) => {
  ctx.session.isNew = false;
  if (ctx.session.type === ITEMS_TYPES.accessories) {
    ctx.session.screen = SCREENS.brandSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
    renderControls(ctx);
    return;
  }
  ctx.session.screen = SCREENS.sizeSelection;
  const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
  renderControls(ctx);
});

bot.hears('Назад', async (ctx) => {
  if (ctx.session.screen === SCREENS.qualitySelection) {
    ctx.session.screen = SCREENS.typeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx);
  } else if (ctx.session.screen === SCREENS.sizeSelection) {
    if (ctx.session.type === ITEMS_TYPES.clothes) {
      ctx.session.screen = SCREENS.qualitySelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.qualitySelection]];
      renderControls(ctx);
    } else {
      ctx.session.screen = SCREENS.typeSelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.typeSelection]];
      renderControls(ctx);
    }
  } else if (ctx.session.screen === SCREENS.brandSelection) {
    if (
      ctx.session.type === ITEMS_TYPES.clothes ||
      ctx.session.type === ITEMS_TYPES.shoes
    ) {
      ctx.session.screen = SCREENS.sizeSelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.sizeSelection]];
      renderControls(ctx);
    } else if (ctx.session.type === ITEMS_TYPES.accessories) {
      ctx.session.screen = SCREENS.qualitySelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.qualitySelection]];
      renderControls(ctx);
    }
  }
});

const botOnSizeEvents = (sizes) => {
  sizes.map((label) => {
    return bot.hears(label, async (ctx) => {
      ctx.session.size = label;
      ctx.session.screen = SCREENS.brandSelection;
      const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
      renderControls(ctx);
    });
  });
};

botOnSizeEvents(CLOTHING_SIZES);
botOnSizeEvents(SHOES_SIZES);

/////////////////////////////////////////////////////////////////////////////////////////

bot.hears('Всі бренди', async (ctx) => {
  ctx.session.brand = null;
  ctx.session.screen = SCREENS.itemsSearchSelection;
  await ctx.reply(`Ви обрали всі бренди`);

  const channelPosts = await getAllChannelPosts(
    ctx.session.type,
    ctx.session.isNew,
    ctx.session.size,
    null,
  );

  if (channelPosts.length <= 0) {
    ctx.reply('За вашим запитом ще немає речей');
  } else {
    ctx.reply('Перелік речей за вашим запитом:');
    await renderChannelPosts(ctx, channelPosts, ctx.session.postsOffset);
  }
});

bot.hears(BRANDS_EVENT_REGEXP, async (ctx) => {
  ctx.session.brand = ctx.match.input.replace(BUTTONS_ICONS.brandsIcon, '');
  ctx.session.screen = SCREENS.itemsSearchSelection;
  await ctx.reply(`Ви обрали бренд ${ctx.session.brand}`);

  const channelPosts = await getAllChannelPosts(
    ctx.session.type,
    ctx.session.isNew,
    ctx.session.size,
    ctx.session.brand,
  );

  if (channelPosts.length <= 0) {
    ctx.reply('За вашим запитом ще немає речей');
  } else {
    ctx.reply('Перелік речей за вашим запитом:');
    await renderChannelPosts(ctx, channelPosts, ctx.session.postsOffset);
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////
bot.hears('Завантажити ще', async (ctx) => {
  ctx.session.postsOffset += 10;

  const channelPosts = await getAllChannelPosts(
    ctx.session.type,
    ctx.session.isNew,
    ctx.session.size,
    ctx.session.brand,
  );

  await renderChannelPosts(ctx, channelPosts, ctx.session.postsOffset);
});

bot.hears('Знайти інші речі', async (ctx) => {
  ctx.session.isNew = null;
  ctx.session.type = null;
  ctx.session.size = null;
  ctx.session.brand = null;
  ctx.session.screen = SCREENS.typeSelection;
  ctx.session.postsOffset = 0;

  const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
  renderControls(ctx);
});

////////////////////////////////////////////////////////////////////////////////////

bot.on('channel_post:media', async (ctx) => {
  const channelPostData = ctx.update.channel_post;

  let mediaGroupId = null;
  let messageId = null;
  let isInStock = null;
  let itemType = null;
  let isNew = null;
  let sizes = [];
  let brand = null;
  let createdAtDate = null;
  let editAtDate = null;

  if (channelPostData.caption) {
    isInStock =
      channelPostData.caption.includes('#в_наявності') ||
      !channelPostData.caption.includes('ПРОДАНО');

    isNew =
      channelPostData.caption.includes('#нове') ||
      channelPostData.caption.includes('Нова');

    if (channelPostData.caption.includes('#взуття')) {
      itemType = ITEMS_TYPES.shoes;
    } else if (channelPostData.caption.includes('#аксесуари')) {
      itemType = ITEMS_TYPES.accessories;
    } else itemType = ITEMS_TYPES.clothes;

    if (channelPostData.caption.match(SIZE_REGEXP)) {
      sizes = channelPostData.caption.match(SIZE_REGEXP).map((size) => {
        size = size.replace('#розмір_', '');
        return (size = size.replace('_', '.'));
      });
    }

    if (channelPostData.caption.match(BRAND_REGEXP)) {
      brand = channelPostData.caption
        .match(BRAND_REGEXP)[0]
        .replace('#бренд_', '')
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    if (channelPostData.date) {
      createdAtDate = moment
        .unix(channelPostData.date)
        .utc()
        .format('YYYY-MM-DD HH:mm:ssZ');
    }

    if (channelPostData.edit_date) {
      editAtDate = moment
        .unix(channelPostData.edit_date)
        .utc()
        .format('YYYY-MM-DD HH:mm:ssZ');
    }
  }

  if (channelPostData.media_group_id) {
    mediaGroupId = channelPostData.media_group_id;
  }

  if (channelPostData.message_id) {
    messageId = channelPostData.message_id;
  }

  await upsertMessage(
    mediaGroupId,
    messageId,
    isInStock,
    itemType,
    isNew,
    sizes,
    brand,
    createdAtDate,
    editAtDate,
  );
});

//////////////////////////////////////////////////////////////////////////////////////

bot.on('edited_channel_post:media', async (ctx) => {
  const editedChannelPostData = ctx.update.edited_channel_post;

  let mediaGroupId = null;
  let messageId = null;
  let isInStock = null;
  let itemType = null;
  let isNew = null;
  let sizes = [];
  let brand = null;
  let createdAtDate = null;
  let editAtDate = null;

  if (editedChannelPostData.message_id) {
    messageId = editedChannelPostData.message_id;
  }

  if (editedChannelPostData.media_group_id) {
    mediaGroupId = editedChannelPostData.media_group_id;
  }

  if (editedChannelPostData.caption) {
    isInStock = editedChannelPostData.caption.includes('#в_наявності');

    isNew =
      editedChannelPostData.caption.includes('#нове') ||
      editedChannelPostData.caption.includes('Нова');

    if (editedChannelPostData.caption.includes('#взуття')) {
      itemType = ITEMS_TYPES.shoes;
    } else if (editedChannelPostData.caption.includes('#аксесуари')) {
      itemType = ITEMS_TYPES.accessories;
    } else itemType = ITEMS_TYPES.clothes;

    if (editedChannelPostData.caption.match(SIZE_REGEXP)) {
      sizes = editedChannelPostData.caption.match(SIZE_REGEXP).map((size) => {
        size = size.replace('#розмір_', '');
        return (size = size.replace('_', '.'));
      });
    }

    if (editedChannelPostData.caption.match(BRAND_REGEXP)) {
      brand = editedChannelPostData.caption
        .match(BRAND_REGEXP)[0]
        .replace('#бренд_', '')
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    if (editedChannelPostData.date) {
      createdAtDate = moment
        .unix(editedChannelPostData.date)
        .utc()
        .format('YYYY-MM-DD HH:mm:ssZ');
    }

    if (editedChannelPostData.edit_date) {
      editAtDate = moment
        .unix(editedChannelPostData.edit_date)
        .utc()
        .format('YYYY-MM-DD HH:mm:ssZ');
    }
  }
  await upsertMessage(
    mediaGroupId,
    messageId,
    isInStock,
    itemType,
    isNew,
    sizes,
    brand,
    createdAtDate,
    editAtDate,
  );
});

const runner = run(bot);

const stopRunner = () => runner.isRunning() && runner.stop();
process.once('SIGINT', stopRunner);
process.once('SIGTERM', stopRunner);
