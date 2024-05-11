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
        let offsetId = +ALL_DATA[ALL_DATA.length - 1]['message-id'];
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
        let isInStock = null;
        let isNew = null;
        let createdAtDate = null;
        let editAtDate = null;
        let brand = null;
        let itemType = null;
        let sizes = [];

        if (message.id) {
          messageId = message.id;
        }

        if (message.groupedId) {
          mediaGroupId = message.groupedId.toString();
        }

        if (message.message) {
          if (message.message.includes('#взуття')) {
            itemType = 'взуття';
          } else if (message.message.includes('#аксесуари')) {
            itemType = 'аксесуари';
          } else itemType = 'одяг';

          if (message.message.match(SIZE_REGEXP)) {
            sizes = message.message.match(SIZE_REGEXP).map((size) => {
              size = size.replace('#розмір_', '').replace('_', '.');
              return size;
            });
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
          'message-id': messageId,
          'media-group-id': mediaGroupId,
          'is-in-stock': isInStock,
          'item-type': itemType,
          'is-new': isNew,
          'brand': brand,
          'sizes': sizes,
          'created-at-date': createdAtDate,
          'editer-at-date': editAtDate,
        });
      });

      await sleep(5000);
    }

    const ALL_CHANNEL_MESSAGES = ALL_DATA.sort(
      (a, b) => b['message-id'] - a['message-id'],
    );

    saveDataToFile(ALL_CHANNEL_MESSAGES, 'messages/messages.json');
  };

  await scrapAllChannelPosts();
})();
