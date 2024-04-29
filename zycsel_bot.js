require('dotenv').config();
const { getChannelPosts } = require('./database/getChannelPosts');
const { renderChannelPosts } = require('./render/renderChannelPosts');
const {
  upsertPostToDatabase,
  upsertMediaToDatabase,
} = require('./database/upsertPostToDatabase');
const moment = require('moment');
const { Bot, GrammyError, HttpError, Keyboard, session } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

///////////////////////////////////////////////////////////////////////////////////////////////

(async () => {
  const bot = new Bot(process.env.BOT_AUTH_TOKEN);

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

  ///////////////////////////////////////////////////////////////////////////////////////////////

  await bot.api.setMyCommands([
    { command: 'start', description: 'Розпочати пошук' },
  ]);

  ///////////////////////////////////////////////////////////////////////////////////////////////

  const itemsTypes = {
    clothes: 'одяг',
    shoes: 'взуття',
    accessories: 'аксесуари',
  };

  const clothingSizes = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    'Джуніор',
    'Жіноче',
  ];
  const shoesSizes = [
    '40',
    '41',
    '42',
    '42_5',
    '43',
    '43_5',
    '44',
    '44_5',
    '45',
    '45_5',
    '46',
    '47',
  ];

  ///////////////////////////////////////////////////////////////////////////////////////////////

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
    if (ctx.session.type === itemsTypes.clothes) {
      sizeButtons = await supabase
        .from('Zycsel-channel-posts-table')
        .select('sizes')
        .eq('type', 'одяг')
        .eq('is-new', ctx.session.isNew)
        .eq('is-in-stock', true);
    } else if (ctx.session.type === itemsTypes.shoes) {
      sizeButtons = await supabase
        .from('Zycsel-channel-posts-table')
        .select('sizes', { distict: true })
        .eq('type', 'взуття')
        .eq('is-in-stock', true);
    }

    sizeButtons = sizeButtons.data
      .map((element) => element.sizes)
      .flatMap((subArray) => subArray);

    sizeButtons = Array.from(new Set(sizeButtons));

    sizeButtons = clothingSizes.filter((label) => sizeButtons.includes(label));

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
    if (ctx.session.type === itemsTypes.accessories) {
      brandButtons = await supabase
        .from('Zycsel-channel-posts-table')
        .select('brand')
        .eq('type', itemsTypes.accessories)
        .eq('is-new', ctx.session.isNew)
        .eq('is-in-stock', true);
    } else if (ctx.session.type === itemsTypes.clothes) {
      brandButtons = await supabase
        .from('Zycsel-channel-posts-table')
        .select('brand')
        .eq('type', itemsTypes.clothes)
        .eq('is-new', ctx.session.isNew)
        .eq('is-in-stock', true);
    } else if (ctx.session.type === itemsTypes.shoes) {
      brandButtons = await supabase
        .from('Zycsel-channel-posts-table')
        .select('brand')
        .eq('type', itemsTypes.shoes)
        .eq('is-new', ctx.session.isNew)
        .eq('is-in-stock', true);
    }
    brandButtons = brandButtons.data.map((element) => element.brand);

    brandButtons = brandButtons.flatMap((subArray) => subArray);

    brandButtons = Array.from(new Set(brandButtons));

    brandButtons = brandButtons.filter(
      (element) => !['Stone Island', 'Cp Company'].includes(element),
    );

    brandButtons = brandButtons.sort();

    brandButtons = brandButtons;

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

  const SCREENS = {
    qualitySelection: 'qualitySelection',
    typeSelection: 'typeSelection',
    sizeSelection: 'sizeSelection',
    brandSelection: 'brandSelection',
    itemsSearchSelection: 'itemsSearchSelection',
  };

  const SCREEN_FACTORY = {
    [SCREENS.typeSelection]: renderTypeControls,
    [SCREENS.qualitySelection]: renderQualityControls,
    [SCREENS.sizeSelection]: renderSizeControls,
    [SCREENS.brandSelection]: renderBrandControls,
    [SCREENS.itemsSearchSelection]: renderItemsSearchControls,
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////

  function initial() {
    return {
      screen: '',
      isNew: true,
      type: 'одяг',
      size: '',
      brand: '',
    };
  }

  bot.use(session({ initial }));

  ///////////////////////////////////////////////////////////////////////////////////////////////

  const qualityKeyboard = new Keyboard()
    .text('Нові')
    .row()
    .resized()
    .text('Вживані')
    .row()
    .resized()
    .text('Назад')
    .row()
    .resized()
    .placeholder('Оберіть стан речей');

  const typeKeyboard = new Keyboard()
    .text('Одяг')
    .row()
    .resized()
    .text('Взуття')
    .row()
    .text('Аксесуари')
    .row()
    .resized()
    .placeholder('Оберіть тип речей');

  const sizesKeyboard = (sizesLabels) => {
    const sizesButtons = sizesLabels.map((label) => {
      return [Keyboard.text(label)];
    });

    sizesButtons.unshift([Keyboard.text('Назад')]);

    const sizeKeyboard = Keyboard.from(sizesButtons)
      .resized()
      .placeholder('Оберіть розмір речей');

    return sizeKeyboard;
  };

  const brandKeyboard = (brands) => {
    const brandButtons = brands.map((label) => {
      return [Keyboard.text(label)];
    });

    brandButtons.unshift(
      [Keyboard.text('Назад')],
      [Keyboard.text('Всі бренди')],
      [Keyboard.text('Stone Island')],
      [Keyboard.text('Cp Company')],
    );

    const brandsKeyboard = Keyboard.from(brandButtons)
      .resized()
      .placeholder('Оберіть бренд');

    return brandsKeyboard;
  };

  const itemsSearchKeyboard = new Keyboard().text('Знайти інші речі').row();

  ///////////////////////////////////////////////////////////////////////////////////////////////

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
    ctx.session.type = 'одяг';
    ctx.session.screen = SCREENS.qualitySelection;
    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx);
  });

  bot.hears('Взуття', async (ctx) => {
    ctx.session.type = 'взуття';
    ctx.session.isNew = true;
    ctx.session.screen = SCREENS.sizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.sizeSelection];
    renderControls(ctx);
  });

  bot.hears('Аксесуари', async (ctx) => {
    ctx.session.type = 'аксесуари';
    ctx.session.screen = SCREENS.qualitySelection;
    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx);
  });
  ///////////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Нові', async (ctx) => {
    ctx.session.isNew = true;
    if (ctx.session.type === 'аксесуари') {
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
    if (ctx.session.type === 'аксесуари') {
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
      ctx.session.screen = SCREENS.qualitySelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.typeSelection]];
      renderControls(ctx);
    } else if (ctx.session.screen === SCREENS.sizeSelection) {
      ctx.session.screen = SCREENS.typeSelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.typeSelection]];
      renderControls(ctx);
    } else if (ctx.session.screen === SCREENS.brandSelection) {
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.typeSelection]];
      renderControls(ctx);
    }
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////

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

  botOnSizeEvents(clothingSizes);
  botOnSizeEvents(shoesSizes);

  /////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Всі бренди', async (ctx) => {
    ctx.session.brand = '';
    ctx.session.screen = SCREENS.itemsSearchSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.itemsSearchSelection];
    renderControls(ctx);

    const channelPosts = await getChannelPosts(
      ctx.session.isNew,
      ctx.session.type,
      ctx.session.size,
      ctx.session.brand,
    );

    if (channelPosts.length <= 0) {
      ctx.reply('За вашим запитом ще немає речей');
    } else {
      ctx.reply('Перелік речей за вашим запитом:');
      await renderChannelPosts(ctx, channelPosts);
    }
  });

  let brands = await supabase
    .from('Zycsel-channel-posts-table')
    .select('brand')
    .eq('is-in-stock', true);

  brands = brands.data
    .map((element) => element.brand)
    .flatMap((subArray) => subArray);

  brands = Array.from(new Set(brands));

  const botOnBrandEvents = async (brands) => {
    brands.map((label) => {
      return bot.hears(label, async (ctx) => {
        ctx.session.brand = label;
        ctx.session.screen = SCREENS.itemsSearchSelection;
        const renderControls = SCREEN_FACTORY[SCREENS.itemsSearchSelection];
        renderControls(ctx);

        const channelPosts = await getChannelPosts(
          ctx.session.isNew,
          ctx.session.type,
          ctx.session.size,
          ctx.session.brand,
        );

        if (channelPosts.length <= 0) {
          ctx.reply('За вашим запитом ще немає речей');
        } else {
          ctx.reply('Перелік речей за вашим запитом:');
          await renderChannelPosts(ctx, channelPosts);
        }
      });
    });
  };

  await botOnBrandEvents(brands);
  ///////////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Знайти інші речі', async (ctx) => {
    ctx.session.isNew = null;
    ctx.session.type = '';
    ctx.session.size = '';
    ctx.session.brand = '';
    ctx.session.screen = SCREENS.typeSelection;

    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx);
  });

  ////////////////////////////////////////////////////////////////////////////////////

  const sizeRegExp =
    /#розмір_(?:[a-zA-Zа-яА-ЯҐґЄєІіЇїЁёәӘңҮүҖҗҒғҺһӨөҮү]+|\d+(?:_\d+)?)/g;

  const brandRegExp = /#бренд_\w+/;

  ////////////////////////////////////////////////////////////////////////////////////

  bot.on('channel_post:media', async (ctx) => {
    const channelPostData = ctx.update.channel_post;

    let messageId;
    let mediaGroupId;
    let postMedia;
    let mediaType;

    if (channelPostData.message_id) {
      messageId = channelPostData.message_id;
    }

    if (channelPostData.media_group_id) {
      mediaGroupId = channelPostData.media_group_id;
    }

    if (channelPostData.caption) {
      let postCaption;
      let isNew;
      let isInStock;
      let createdAtDate;
      let editAtDate;
      let brand;
      let sizes = [];
      let itemType;

      postCaption = channelPostData.caption;

      if (channelPostData.caption.includes('#взуття')) {
        itemType = 'взуття';
      } else if (channelPostData.caption.includes('#аксесуари')) {
        itemType = 'аксесуари';
      } else itemType = 'одяг';

      if (channelPostData.caption.match(sizeRegExp)) {
        const channelPostSizes = channelPostData.caption
          .match(sizeRegExp)
          .map((size) => {
            return size.replace('#розмір_', '');
          });
        sizes = channelPostSizes;
      }

      if (channelPostData.caption.match(brandRegExp)) {
        brand = channelPostData.caption
          .match(brandRegExp)[0]
          .replace('#бренд_', '')
          .replace('_', ' ');

        brand = brand.replace(/\b\w/g, (char) => char.toUpperCase());
      }

      isInStock = channelPostData.caption.includes('#в_наявності');

      isNew = channelPostData.caption.includes('#нове');

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

      await upsertPostToDatabase(
        mediaGroupId,
        postCaption,
        createdAtDate,
        editAtDate,
        isNew,
        isInStock,
        brand,
        sizes,
        itemType,
      );
    }

    if (channelPostData.photo) {
      postMedia = channelPostData.photo[0].file_id;
      mediaType = 'photo';
    } else if (channelPostData.video) {
      postMedia = channelPostData.video.file_id;
      mediaType = 'video';
    }

    await upsertMediaToDatabase(messageId, mediaGroupId, postMedia, mediaType);
  });

  //////////////////////////////////////////////////////////////////////////////////////

  bot.on('edited_channel_post:media', async (ctx) => {
    const editedChannelPostData = ctx.update.edited_channel_post;

    let messageId;
    let mediaGroupId;
    let postMedia;
    let editAtDate;
    let mediaType;

    if (editedChannelPostData.message_id) {
      messageId = editedChannelPostData.message_id;
    }

    if (editedChannelPostData.media_group_id) {
      mediaGroupId = editedChannelPostData.media_group_id;
    }

    if (editedChannelPostData.caption) {
      let postCaption;
      let isNew;
      let isInStock;
      let brand = '';
      let sizes = [];
      let itemType;

      postCaption = editedChannelPostData.caption;

      if (editedChannelPostData.caption.includes('#взуття')) {
        itemType = 'взуття';
      } else if (editedChannelPostData.caption.includes('#аксесуари')) {
        itemType = 'аксесуари';
      } else itemType = 'одяг';

      if (editedChannelPostData.caption.match(sizeRegExp)) {
        const channelPostSizes = editedChannelPostData.caption
          .match(sizeRegExp)
          .map((size) => {
            return size.replace('#розмір_', '');
          });
        sizes = channelPostSizes;
      }

      if (editedChannelPostData.caption.match(brandRegExp)) {
        brand = editedChannelPostData.caption
          .match(brandRegExp)[0]
          .replace('#бренд_', '')
          .replace('_', ' ');

        brand = brand.charAt(0).toUpperCase() + brand.slice(1);
      }

      isInStock = editedChannelPostData.caption.includes('#в_наявності');

      isNew = editedChannelPostData.caption.includes('#нове');

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

      await upsertPostToDatabase(
        mediaGroupId,
        postCaption,
        createdAtDate,
        editAtDate,
        isNew,
        isInStock,
        brand,
        sizes,
        itemType,
      );
    }

    if (editedChannelPostData.photo) {
      postMedia = editedChannelPostData.photo[0].file_id;
    } else if (editedChannelPostData.video) {
      postMedia = editedChannelPostData.video.file_id;
    }

    await upsertMediaToDatabase(messageId, mediaGroupId, postMedia, mediaType);
  });

  bot.start();
})();
