require('dotenv').config();
const { getChannelPosts } = require('./database/getChannelPosts');
const { renderChannelPosts } = require('./render/renderChannelPosts');
const {
  updatePostDataToDatabase,
  upsertMediaToDatabase,
} = require('./database/postToDatabase');
const moment = require('moment');
const { Bot, GrammyError, HttpError, session } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const {
  SCREENS,
  ITEMS_TYPES,
  CLOTHING_SIZES,
  SHOES_SIZES,
  SIZE_REGEXP,
  BRAND_REGEXP,
  TABLES,
} = require('./components/constants');
const { SCREEN_FACTORY } = require('./render/renderControls');
const { hydrateFiles } = require('@grammyjs/files');
const {
  sendFileToStorage,
  uploadPhotoToStorage,
  uploadVideoToStorage,
} = require('./database/sendFileToStorage');
const { upsertBrandToDatabase } = require('./database/upsertBrandToDatabase');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const bot = new Bot(process.env.BOT_AUTH_TOKEN);
  bot.api.config.use(hydrateFiles(process.env.BOT_AUTH_TOKEN));

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

  function initial() {
    return {
      screen: '',
      isNew: true,
      type: ITEMS_TYPES.clothes,
      size: '',
      brand: '',
    };
  }

  bot.use(session({ initial }));

  await bot.api.setMyCommands([
    { command: 'start', description: 'Розпочати пошук' },
  ]);

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
        const renderControls =
          SCREEN_FACTORY[SCREENS[SCREENS.qualitySelection]];
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
        const renderControls =
          SCREEN_FACTORY[SCREENS[SCREENS.qualitySelection]];
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

  let brands = await supabase.from('Post-brands').select('brand');

  brands = brands.data
    .map((element) => element.brand)
    .flatMap((subArray) => subArray);

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

  bot.on('channel_post:media', async (ctx) => {
    const channelPostData = ctx.update.channel_post;

    let messageId;
    let mediaGroupId;
    let mediaType;
    let postCaption;
    let isNew;
    let isInStock;
    let createdAtDate;
    let editAtDate;
    let brand;
    let itemType;
    let sizes = [];

    if (channelPostData.caption) {
      postCaption = channelPostData.caption;

      if (channelPostData.caption.includes('#взуття')) {
        itemType = ITEMS_TYPES.shoes;
      } else if (channelPostData.caption.includes('#аксесуари')) {
        itemType = ITEMS_TYPES.accessories;
      } else itemType = ITEMS_TYPES.clothes;

      if (channelPostData.caption.match(SIZE_REGEXP)) {
        const channelPostSizes = channelPostData.caption
          .match(SIZE_REGEXP)
          .map((size) => {
            size = size.replace('#розмір_', '');
            return `{${size}}`;
          })
          .join(' ');

        sizes = channelPostSizes;
      }

      if (channelPostData.caption.match(BRAND_REGEXP)) {
        brand = channelPostData.caption
          .match(BRAND_REGEXP)[0]
          .replace('#бренд_', '')
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        await upsertBrandToDatabase(brand);
      }

      isInStock =
        channelPostData.caption.includes('#в_наявності') ||
        !channelPostData.caption.includes('ПРОДАНО');

      isNew =
        channelPostData.caption.includes('#нове') ||
        channelPostData.caption.includes('Нова');

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

    const isPostInDatabase = await supabase
      .from(TABLES.postsTable)
      .select('messages-ids')
      .eq('media-group-id', mediaGroupId);

    if (isPostInDatabase.data.length <= 0) {
      const emptyPostMessagesIds = await supabase
        .from(TABLES.postsTable)
        .insert({
          'media-group-id': mediaGroupId,
          'messages-ids': messageId,
        });

      if (channelPostData.caption) {
        await updatePostDataToDatabase(
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
    } else {
      const existingPostMessageIds = await supabase
        .from(TABLES.postsTable)
        .update({
          'messages-ids': [
            isPostInDatabase.data[0]['messages-ids'].split(' '),
            messageId,
          ].join(', '),
        })
        .eq('media-group-id', mediaGroupId);

      if (channelPostData.caption) {
        await updatePostDataToDatabase(
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
    }

    if (channelPostData.photo) {
      mediaType = 'photo';
      await uploadPhotoToStorage(ctx, channelPostData.message_id);
    } else if (channelPostData.video) {
      mediaType = 'video';
      await uploadVideoToStorage(ctx, channelPostData.message_id);
    }

    upsertMediaToDatabase(channelPostData.message_id, mediaGroupId, mediaType);
  });

  //////////////////////////////////////////////////////////////////////////////////////

  bot.on('edited_channel_post:media', async (ctx) => {
    const editedChannelPostData = ctx.update.edited_channel_post;

    let messageId;
    let mediaGroupId;
    let editAtDate;
    let mediaType;
    let postCaption;
    let isNew;
    let isInStock;
    let brand = '';
    let sizes = [];
    let itemType;

    if (editedChannelPostData.message_id) {
      messageId = editedChannelPostData.message_id;
    }

    if (editedChannelPostData.media_group_id) {
      mediaGroupId = editedChannelPostData.media_group_id;
    }

    if (editedChannelPostData.caption) {
      postCaption = editedChannelPostData.caption;

      if (editedChannelPostData.caption.includes('#взуття')) {
        itemType = ITEMS_TYPES.shoes;
      } else if (editedChannelPostData.caption.includes('#аксесуари')) {
        itemType = ITEMS_TYPES.accessories;
      } else itemType = ITEMS_TYPES.clothes;

      if (editedChannelPostData.caption.match(SIZE_REGEXP)) {
        const channelPostSizes = editedChannelPostData.caption
          .match(SIZE_REGEXP)
          .map((size) => {
            size = size.replace('#розмір_', '');
            return `{${size}}`;
          })
          .join(' ');
        sizes = channelPostSizes;
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

      isInStock = editedChannelPostData.caption.includes('#в_наявності');

      isNew =
        editedChannelPostData.caption.includes('#нове') ||
        editedChannelPostData.caption.includes('Нова');

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

      await updatePostDataToDatabase(
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

    let currentMessagesIds = await supabase
      .from('Post-messages-media')
      .select('media-type, id')
      .eq('media-group-id', mediaGroupId);

    if (!isInStock) {
      currentMessagesIds = currentMessagesIds.data.map((id) => {
        return (id =
          id['media-type'] === 'photo' ? `${id.id}.jpg` : `${id.id}.mp4`);
      });

      const deleteMediaFromStorage = await supabase.storage
        .from(TABLES.mediaStorage)
        .remove(currentMessagesIds);
    } else {
      currentMessagesIds = currentMessagesIds.data.forEach(async (id) => {
        if (editedChannelPostData.photo) {
          mediaType = 'photo';
          await uploadPhotoToStorage(ctx, id.id);
        } else if (editedChannelPostData.video) {
          mediaType = 'video';
          await uploadVideoToStorage(ctx, id.id);
        }
      });
    }

    await upsertMediaToDatabase(messageId, mediaGroupId, mediaType);
  });

  bot.start();
})();
