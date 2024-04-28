require('dotenv').config();
const { getChannelPosts } = require('./helpers/getChannelPosts');
const { renderChannelPosts } = require('./helpers/renderChannelPosts');
const { createClient } = require('@supabase/supabase-js');
const moment = require('moment');

const { Bot, GrammyError, HttpError, Keyboard, session } = require('grammy');

///////////////////////////////////////////////////////////////////////////////////////////////

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

  const renderQualityControls = async (ctx) => {
    await ctx.reply(`Будь-ласка, оберіть стан речі.`, {
      reply_markup: qualityKeyboard,
    });
  };

  const renderTypeControls = async (ctx) => {
    const msgReply =
      ctx.match === 'Назад'
        ? 'Оберіть тип речі'
        : `Ви обрали ${ctx.match}. Оберіть тип речі.`;

    await ctx.reply(msgReply, {
      reply_markup: typeKeyboard,
    });
  };

  const renderClothesSizeControls = async (ctx) => {
    const msgReply =
      ctx.match === 'Назад'
        ? 'Оберіть розмір речі'
        : `Ви обрали ${ctx.match}. Оберіть розмір речі.`;

    await ctx.reply(msgReply, {
      reply_markup: sizesKeyboard(clothingSizesLabels),
    });
  };

  const renderShoesSizeControls = async (ctx) => {
    const msgReply =
      ctx.match === 'Назад'
        ? 'Оберіть розмір речі'
        : `Ви обрали ${ctx.match}. Оберіть розмір речі.`;

    await ctx.reply(msgReply, {
      reply_markup: sizesKeyboard(shoesSizeLabels),
    });
  };

  const renderBrandControls = async (ctx) => {
    const msgReply =
      ctx.match === 'Назад' ? 'Оберіть тип речі' : `Вы обрали ${ctx.match}.`;
    await ctx.reply(msgReply, {
      reply_markup: brandKeyboard(brands),
    });
  };

  const renderItemsSearchControls = async (ctx) => {
    const msgReply =
      ctx.match === 'Будь-який'
        ? 'Ви обрали усі бренди'
        : `Ви обрали бренд ${ctx.match}`;

    await ctx.reply(msgReply, {
      reply_markup: itemsSearchKeyboard,
    });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////

  const SCREENS = {
    qualitySelection: 'qualitySelection',
    typeSelection: 'typeSelection',
    clothesSizeSelection: 'clothesSizeSelection',
    shoesSizeSelection: 'shoesSizeSelection',
    brandSelection: 'brandSelection',
    itemsSearchSelection: 'itemsSearchSelection',
  };

  const SCREEN_FACTORY = {
    [SCREENS.qualitySelection]: renderQualityControls,
    [SCREENS.typeSelection]: renderTypeControls,
    [SCREENS.clothesSizeSelection]: renderClothesSizeControls,
    [SCREENS.shoesSizeSelection]: renderShoesSizeControls,
    [SCREENS.brandSelection]: renderBrandControls,
    [SCREENS.itemsSearchSelection]: renderItemsSearchControls,
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////

  function initial() {
    return {
      screen: '',
      from: 0,
      to: 10,
      isNew: 'true',
      type: 'одяг',
      sizes: '',
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
    .placeholder('Оберіть стан речі');

  const typeKeyboard = new Keyboard()
    .text('Одяг')
    .row()
    .resized()
    .text('Взуття')
    .row()
    .text('Аксесуари')
    .row()
    .resized()
    .text('Назад')
    .row()
    .resized()
    .placeholder('Оберіть тип речі');

  const clothingSizesLabels = ['хс', 'с', 'м', 'л', 'хл', 'ххл', 'хххл'];
  const shoesSizeLabels = [
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

  const sizesKeyboard = (sizesLabels) => {
    const sizesButtons = sizesLabels.map((label) => {
      return [Keyboard.text(label)];
    });

    sizesButtons.unshift([Keyboard.text('Назад')]);

    const sizeKeyboard = Keyboard.from(sizesButtons)
      .resized()
      .placeholder('Оберіть розмір');

    return sizeKeyboard;
  };

  const brands = [
    'stoneisland',
    'cpcompany',
    'mastrum',
    'aape',
    'a_cold_wall',
    'adidas',
    'alphaindustries',
    'arcteryx',
    'armani',
    'carhartt',
  ];

  const brandKeyboard = (brands) => {
    const brandButtons = brands.map((label) => {
      return [Keyboard.text(label)];
    });

    brandButtons.unshift(
      [Keyboard.text('Назад')],
      [Keyboard.text('Будь-який')],
    );

    const brandsKeyboard = Keyboard.from(brandButtons)
      .resized()
      .placeholder('Оберіть бренд');

    return brandsKeyboard;
  };

  const itemsSearchKeyboard = new Keyboard()
    .text('Завантажити ще')
    .row()
    .text('Знайти інші речі')
    .row();

  ///////////////////////////////////////////////////////////////////////////////////////////////

  bot.command('start', async (ctx) => {
    ctx.session.screen = SCREENS.qualitySelection;
    await ctx.reply(
      'Привіт, на звʼязку бот Zycsel_store🦖 Тут ви можете переглянути всю наявність по брендам/розмірам тощо.',
      {
        reply_to_message_id: ctx.msg.message_id,
      },
    );

    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx);
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Нові', async (ctx) => {
    ctx.session.isNew = true;
    ctx.session.screen = SCREENS.typeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx);
  });

  bot.hears('Вживані', async (ctx) => {
    ctx.session.screen = SCREENS.typeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.typeSelection];
    renderControls(ctx);
  });

  bot.hears('Назад', async (ctx) => {
    if (ctx.session.screen === SCREENS.typeSelection) {
      ctx.session.screen = SCREENS.qualitySelection;
      const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
      renderControls(ctx);
    } else if (
      ctx.session.screen === SCREENS.clothesSizeSelection ||
      ctx.session.screen === SCREENS.shoesSizeSelection
    ) {
      ctx.session.screen = SCREENS.typeSelection;
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.typeSelection]];
      renderControls(ctx);
    } else if (ctx.session.screen === SCREENS.brandSelection) {
      const renderControls = SCREEN_FACTORY[SCREENS[SCREENS.typeSelection]];
      renderControls(ctx);
    }
  });

  /////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Одяг', async (ctx) => {
    ctx.session.type = 'одяг';
    ctx.session.screen = SCREENS.clothesSizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.clothesSizeSelection];
    renderControls(ctx);
  });

  bot.hears('Взуття', async (ctx) => {
    ctx.session.type = 'взуття';
    ctx.session.screen = SCREENS.shoesSizeSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.shoesSizeSelection];
    renderControls(ctx);
  });

  bot.hears('Аксесуари', async (ctx) => {
    ctx.session.type = 'аксесуари';
    ctx.session.screen = SCREENS.brandSelection;
    const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
    renderControls(ctx);
  });
  ///////////////////////////////////////////////////////////////////////////////////////////////

  const botOnSizeEvents = (sizes) => {
    sizes.map((label) => {
      return bot.hears(label, async (ctx) => {
        ctx.session.sizes = label;
        ctx.session.screen = SCREENS.brandSelection;
        const renderControls = SCREEN_FACTORY[SCREENS.brandSelection];
        renderControls(ctx);
      });
    });
  };

  botOnSizeEvents(clothingSizesLabels);
  botOnSizeEvents(shoesSizeLabels);

  ///////////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Будь-який', async (ctx) => {
    ctx.session.brand = '';
    ctx.session.screen = SCREENS.itemsSearch;
    const renderControls = SCREEN_FACTORY[SCREENS.itemsSearchSelection];
    console.log(ctx.session);
    renderControls(ctx);

    const channelPosts = await getChannelPosts(
      ctx.session.from,
      ctx.session.to,
      ctx.session.isNew,
      ctx.session.type,
      ctx.session.sizes,
      ctx.session.brand,
    );

    if (channelPosts.length <= 0) {
      ctx.reply('За вашим запитом більше немає речей');
    } else {
      await renderChannelPosts(channelPosts);
    }
  });

  const botOnBrandEvents = (brands) => {
    brands.map((label) => {
      return bot.hears(label, async (ctx) => {
        ctx.session.screen = SCREENS.itemsSearchSelection;
        const renderControls = SCREEN_FACTORY[SCREENS.itemsSearchSelection];
        ctx.session.brand = label;
        renderControls(ctx);

        const channelPosts = await getChannelPosts(
          ctx.session.from,
          ctx.session.to,
          ctx.session.isNew,
          ctx.session.type,
          ctx.session.sizes,
          ctx.session.brand,
        );

        if (channelPosts.length <= 0) {
          ctx.reply('За вашим запитом більше немає речей');
        } else {
          await renderChannelPosts(channelPosts);
        }
      });
    });
  };

  botOnBrandEvents(brands);
  ///////////////////////////////////////////////////////////////////////////////////////////////

  bot.hears('Завантажити ще', async (ctx) => {
    ctx.session.from = ctx.session.from + 10;
    ctx.session.to = ctx.session.to + 10;

    const channelPosts = await getChannelPosts(
      ctx.session.from,
      ctx.session.to,
      ctx.session.isNew,
      ctx.session.type,
      ctx.session.sizes,
      ctx.session.brand,
    );

    if (channelPosts.length <= 0) {
      ctx.reply('За вашим запитом більше немає речей');
    } else {
      await renderChannelPosts(channelPosts);
    }
  });

  bot.hears('Знайти інші речі', async (ctx) => {
    ctx.session.from = 0;
    ctx.session.to = 10;
    ctx.session.isNew = true;
    ctx.session.type = '';
    ctx.session.sizes = '';
    ctx.session.brand = '';
    ctx.session.screen = SCREENS.qualitySelection;

    const renderControls = SCREEN_FACTORY[SCREENS.qualitySelection];
    renderControls(ctx);
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////

  const sendPostToDatabase = async (
    mediaGroupId,
    postCaption,
    createdAtDate,
    editAtDate,
    isNew,
    isInStock,
    brand,
    sizes,
    itemType,
  ) => {
    const { data, error } = await supabase
      .from('Zycsel-channel-posts-table')
      .upsert({
        'media-group-id': mediaGroupId,
        'post-caption': postCaption,
        'created-at-date': createdAtDate,
        'edited-at-date': editAtDate,
        'is-new': isNew,
        'is-in-stock': isInStock,
        'brand': brand,
        'sizes': sizes,
        'type': itemType,
      })
      .select();
  };

  const sendMediaToDatabase = async (
    messageId,
    mediaGroupId,
    postMedia,
    mediaType,
  ) => {
    const { data, error } = await supabase
      .from('Post-media')
      .insert({
        'id': messageId,
        'media-group-id': mediaGroupId,
        'media-files': postMedia,
        'media-type': mediaType,
      })
      .select();
  };

  ///////////////////////////////////////////////////////////////////////////

  const editPostInDatabase = async (
    mediaGroupId,
    postCaption,
    editAtDate,
    isNew,
    isInStock,
    brand,
    sizes,
    itemType,
  ) => {
    const { data, error } = await supabase
      .from('Zycsel-channel-posts-table')
      .update({
        'post-caption': postCaption,
        'edited-at-date': editAtDate,
        'is-new': isNew,
        'is-in-stock': isInStock,
        'brand': brand,
        'sizes': sizes,
        'type': itemType,
      })
      .eq('media-group-id', mediaGroupId)
      .select();
  };

  const editMediaInDatabase = async (mediaGroupId, postMedia, mediaType) => {
    const { data, error } = await supabase
      .from('Post-media')
      .update({ 'media-files': postMedia, 'media-type': mediaType })
      .eq('media-group-id', mediaGroupId)
      .select();
  };

  ////////////////////////////////////////////////////////////////////////////////////

  const sizeRegExp =
    /#розмір_(?:[а-яА-ЯҐґЄєІіЇїЁёәӘңҮүҖҗҒғҺһӨөҮү]+|\d+(?:_\d+)?)/g;

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
      let sizes;
      let itemType;

      postCaption = channelPostData.caption;

      if (channelPostData.caption.includes('#взуття')) {
        itemType = 'взуття';
      } else if (channelPostData.caption.includes('#аксесуари')) {
        itemType = 'аксесуари';
      } else itemType = 'одяг';

      if (channelPostData.caption.match(sizeRegExp)) {
        sizes = channelPostData.caption
          .match(sizeRegExp)
          .map((size) => size.replace('#розмір_', ''))
          .join(', ');
      }

      if (channelPostData.caption.match(brandRegExp)) {
        brand = channelPostData.caption.match(brandRegExp);
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

      await sendPostToDatabase(
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

    await sendMediaToDatabase(messageId, mediaGroupId, postMedia, mediaType);
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
      let brand;
      let sizes;
      let itemType;

      postCaption = editedChannelPostData.caption;

      if (editedChannelPostData.caption.includes('#взуття')) {
        itemType = 'взуття';
      } else if (editedChannelPostData.caption.includes('#аксесуари')) {
        itemType = 'аксесуари';
      } else itemType = 'одяг';

      if (editedChannelPostData.caption.match(sizeRegExp)) {
        sizes = editedChannelPostData
          .match(sizeRegExp)
          .map((size) => size.replace('#розмір_', ''))
          .join(', ');
      }

      if (editedChannelPostData.caption.match(brandRegExp)) {
        brand = editedChannelPostData.caption.match(brandRegExp);
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

      await editPostInDatabase(
        mediaGroupId,
        postCaption,
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

    await editMediaInDatabase(messageId, mediaGroupId, postMedia, mediaType);
  });

  bot.start();
})();
