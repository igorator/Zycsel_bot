require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const moment = require('moment');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InputMediaBuilder,
} = require('grammy');
const input = require('input');

//////////////////////////////////////////////////////////////////////////////////
const apiId = +process.env.TELEGRAM_APP_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const botAuthToken = process.env.BOT_AUTH_TOKEN;
const stringSessionBot = process.env.TELEGRAM_STRING_SESSION;
const stringSessionMan = new StringSession(
  process.env.TELEGRAM_STRING_SESSION_MAN,
);
const channelId = process.env.CHANNEL_ID;

const clientBot = new TelegramClient(
  new StringSession(stringSessionBot),
  apiId,
  apiHash,
  {},
);

const clientMan = new TelegramClient(stringSessionMan, apiId, apiHash, {
  connectionRetries: 5,
});

///////////////////////////////////////////////////////////////////////////////////

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

////////////////////////////////////////////////////////////////////////////////////
loginClient = async () => {
  await clientMan.start({
    phoneNumber: async () => await input.text('number ?'),
    password: async () => await input.text('password?'),
    phoneCode: async () => await input.text('Code ?'),
    onError: (err) => console.error(err),
  });
};

const connectClients = async () => {
  await clientBot.connect();

  await clientMan.connect();

  if (!clientMan) {
    loginClient();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////
// const getChannelMessages = async (
//   step = 10,
//   messagesSearchQuery = '',
//   offset = 0,
//   quantity,
// ) => {
//   const mediaGroups = [];

//   let channelMessages = await clientMan.getMessages(channelId, {
//     addOffset: offset,
//     limit: step,
//     filter: new Api.InputMessagesFilterPhotoVideo(),
//     search: messagesSearchQuery,
//     //offsetId?: 0
//     //maxId?: number;
//     //minId?: number;
//   });
//   console.log(channelMessages);

//   channelMessages.forEach((message) => {
//     const { id, groupedId } = message;

//     if (!mediaGroups[groupedId]) {
//       mediaGroups[groupedId] = [];
//     }

//     mediaGroups[groupedId].push(id);
//   });

//   let channelMediaGroups = Object.keys(mediaGroups).map((groupId) => ({
//     [groupId]: mediaGroups[groupId],
//   }));

//   return channelMediaGroups;
// };
/////////////////////////////////////////////////////////////////////////////////////////

(async () => {
  await connectClients();

  const bot = new Bot(botAuthToken);

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

  /////////////////////////////////////////////////////////////////////////////////////

  await bot.api.setMyCommands([
    { command: 'start', description: 'Розпочати пошук' },
  ]);

  bot.command(
    'start',
    async (ctx) =>
      await ctx.reply(
        'Привіт, на звʼязку бот Zycsel_store🦖 Тут ви можете переглянути всю наявність по брендам/розмірам тощо.',
        {
          reply_parameters: { message_id: ctx.msg.message_id },
          reply_markup: keyboard,
        },
      ),
  );

  ////////////////////////////////////////////////////////////////////////////////////////

  bot.command('search', async (ctx) => {
    const channelPosts = await getChannelPosts();
    channelPosts.forEach(async (post) => {
      const mediaGroupItems = [];
      const postMedia = await supabase
        .from('Post-media')
        .select(
          'media-files, media-type, Zycsel-channel-posts-table(media-group-id)',
        )
        .eq('media-group-id', post['media-group-id']);

      postMedia.data.forEach((media, index) => {
        if (media['media-type'] === 'photo') {
          if (index === 0) {
            mediaGroupItems.push(
              InputMediaBuilder.photo(media['media-files'], {
                caption: post['post-caption'],
              }),
            );
          }
          mediaGroupItems.push(InputMediaBuilder.photo(media['media-files']));
        } else if (media['media-type'] === 'video') {
          if (index === 0) {
            mediaGroupItems.push(
              InputMediaBuilder.video(media['media-files'], {
                caption: post['post-caption'],
              }),
            );
          }
          mediaGroupItems.push(InputMediaBuilder.video(media['media-files']));
        }
      });
      ctx.replyWithMediaGroup(mediaGroupItems);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  const getChannelPosts = async () => {
    const { data, error } = await supabase
      .from('Zycsel-channel-posts-table')
      .select('*')
      .range(0, 9);

    return data;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
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

  const sizeRegExp = /#розмір_[а-яА-ЯҐґЄєІіЇїЁёәӘңҮүҖҗҒғҺһӨөҮү]+\w*/g;

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
        itemType = '#взуття';
      } else if (channelPostData.caption.includes('#аксесуари')) {
        itemType = '#аксесуари';
      } else itemType = 'одяг';

      if (channelPostData.caption.match(sizeRegExp)) {
        sizes.push(...channelPostData.caption.match(sizeRegExp));
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
      let sizes = [];
      let itemType;

      postCaption = editedChannelPostData.caption;

      if (editedChannelPostData.caption.includes('#взуття')) {
        itemType = '#взуття';
      } else if (editedChannelPostData.caption.includes('#аксесуари')) {
        itemType = '#аксесуари';
      } else itemType = 'одяг';

      if (editedChannelPostData.caption.match(sizeRegExp)) {
        sizes.push(...editedChannelPostData.caption.match(sizeRegExp));
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
  //////////////////////////////////////////////////////////////////////////////////////

  const keyboard = new Keyboard()
    .text('Нові')
    .row()
    .resized()
    .text('Вживані')
    .row()
    .resized()
    .text('search')
    .row()
    .resized()
    .placeholder('');

  ///////////////////////////////////////////////////////////////////////////////////

  bot.start();
})();
