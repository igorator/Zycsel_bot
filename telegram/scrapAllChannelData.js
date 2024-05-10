require('dotenv').config();

const fs = require('fs');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const moment = require('moment');
const { SIZE_REGEXP, BRAND_REGEXP } = require('../components/constants');

const apiId = +process.env.TELEGRAM_APP_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const channelId = process.env.CHANNEL_USERNAME;

const stringSessionMan = new StringSession(
  process.env.TELEGRAM_STRING_SESSION_MAN,
);

const clientMan = new TelegramClient(stringSessionMan, apiId, apiHash, {
  connectionRetries: 5,
});

const loginClient = async () => {
  await clientMan.start({
    phoneNumber: async () => await input.text('number ?'),
    password: async () => await input.text('password?'),
    phoneCode: async () => await input.text('code ?'),
    onError: (err) => console.error(err),
  });
};

const saveDataToFile = (data, filePath) => {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('Data saved to', filePath);
    }
  });
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

(async () => {
  await clientMan.connect();

  if (!clientMan) {
    loginClient();
  }

  const scrapAllChannelPosts = async () => {
    const ALL_DATA = [];
    const postsDataFiltered = [];

    for (i = 100; i > 0; i--) {
      let limit = 3000;
      let channelMessages;
      console.log('limit', limit);

      if (ALL_DATA.length <= 0) {
        channelMessages = await clientMan.getMessages(channelId, {
          addOffset: 0,
          limit: limit,
          filter: new Api.InputMessagesFilterPhotoVideo(),
        });
      } else {
        let offsetId = +ALL_DATA[ALL_DATA.length - 1].id;
        console.log(offsetId);
        channelMessages = await clientMan.getMessages(channelId, {
          offsetId: offsetId,
          limit: limit,
          filter: new Api.InputMessagesFilterPhotoVideo(),
        });
      }

      console.log(channelMessages.length);

      if (channelMessages.length === 0) {
        console.log('No more messages to fetch');
        break;
      }

      channelMessages.forEach(async (message) => {
        let mediaGroupId = null;
        let messageId = null;
        let postMessage = null;
        let isInStock = null;
        let isNew = null;
        let createdAtDate = null;
        let editAtDate = null;
        let brand = null;
        let itemType = null;
        let sizes = null;

        if (message.id) {
          messageId = message.id;
        }

        if (message.groupedId) {
          mediaGroupId = message.groupedId.toString();
        }

        if (message.media.photo) {
          mediaType = 'photo';
        } else if (message.media.document) {
          mediaType = 'video';
        }

        if (message.message) {
          postMessage = message.message;

          if (message.message.includes('#взуття')) {
            itemType = 'взуття';
          } else if (message.message.includes('#аксесуари')) {
            itemType = 'аксесуари';
          } else itemType = 'одяг';

          if (message.message.match(SIZE_REGEXP)) {
            const channelPostSizes = message.message
              .match(SIZE_REGEXP)
              .map((size) => {
                return (size = size.replace('#розмір_', ''));
              });

            sizes = channelPostSizes;
          }

          if (message.message.match(BRAND_REGEXP)) {
            brand = message.message
              .match(BRAND_REGEXP)[0]
              .replace('#бренд_', '')
              .replace(/_/g, ' ')
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }

          isInStock = message.message.includes('#в_наявності');

          isNew =
            message.message.includes('#нове') ||
            message.message.includes('Нова');

          postMessage = postMessage.replace(/\n/g, '@');
        }

        if (message.date) {
          createdAtDate = moment
            .unix(message.date)
            .utc()
            .format('YYYY-MM-DD HH:mm:ssZ');
        }

        if (message.editDate) {
          editAtDate = moment
            .unix(message.editDate)
            .utc()
            .format('YYYY-MM-DD HH:mm:ssZ');
        }

        ALL_DATA.push({
          id: messageId,
          mediaGroupId: mediaGroupId,
          postCaption: postMessage,
          isNew: isNew,
          isInStock: isInStock,
          brand: brand,
          size: sizes,
          itemType: itemType,
          createdAtDate: createdAtDate,
          editedAtDate: editAtDate,
        });
      });

      await sleep(5000);
    }

    ALL_DATA.forEach((message) => {
      if (message.isInStock) {
        postsDataFiltered.push({
          'media-group-id': message.mediaGroupId,
          'messages-ids': ALL_DATA.filter(
            (data) => data.mediaGroupId === message.mediaGroupId,
          ).map((data) => data.id),
          'is-new': message.isNew,
          'brand': message.brand,
          'sizes': message.size,
          'type': message.itemType,
          'created-at-date': message.createdAtDate,
          'edited-at-date': message.editAtDate,
        });
      }
    });

    saveDataToFile(postsDataFiltered, 'posts/posts.json');
  };

  await scrapAllChannelPosts();
})();
