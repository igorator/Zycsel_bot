require('dotenv').config();

let mkConfig, generateCsv, asString;
import('export-to-csv').then(
  ({ mkConfig: mkCfg, generateCsv: genCsv, asString: asStr }) => {
    mkConfig = mkCfg;
    generateCsv = genCsv;
    asString = asStr;
  },
);
const fs = require('fs');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const moment = require('moment');

const {
  SEX_REGEX,
  BRAND_REGEX,
  SIZE_REGEX,
} = require('../src/constants/regex');

const { sleep } = require('./helpers/sleep');

const apiId = +process.env.TELEGRAM_APP_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const channelId = process.env.CHANNEL_USERNAME;

const stringSessionMan = new StringSession(
  process.env.TELEGRAM_STRING_SESSION_MAN,
);

const clientMan = new TelegramClient(stringSessionMan, apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await clientMan.connect();

  const PostsCsvConfig = mkConfig({
    filename: 'Posts',
    useKeysAsHeaders: true,
  });
  const messagesIdsCsvConfig = mkConfig({
    filename: 'MessagesIds',
    useKeysAsHeaders: true,
  });

  const saveCsvFileToDisk = async (config, path, data) => {
    const csv = generateCsv(config)(data);
    const filename = `${config.filename}.csv`;
    const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));

    fs.writeFile(`${path}/${filename}`, csvBuffer, (err) => {
      if (err) throw err;
      console.log('file saved: ', filename);
    });
  };

  const scrapAllChannelPosts = async () => {
    const ALL_DATA = [];

    for (let i = 100; i > 0; i--) {
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
        let isNew = null;
        let isInStock = null;
        let createdAtDate = null;
        let editAtDate = null;
        let brand = null;
        let itemType = null;
        let sizes = null;
        let sex = null;

        if (message.id) {
          messageId = message.id.toString();
        }

        if (message.groupedId) {
          mediaGroupId = message.groupedId.toString();
        }

        if (message.message) {
          if (message.message.includes('#взуття')) {
            itemType = 'взуття';
          } else if (message.message.includes('#аксесуари')) {
            itemType = 'аксесуари';
          } else if (message.message.includes('#парфуми')) {
            itemType = 'парфуми';
          } else itemType = 'одяг';

          if (message.message.match(SEX_REGEX)) {
            sex = message.message.match(SEX_REGEX)[0].replace('#стать_', '');
          }

          if (message.message.match(SIZE_REGEX)) {
            const channelPostSizes = message.message
              .match(SIZE_REGEX)
              .map((size) => {
                size = size.replace('#розмір_', '').replace('_', '.');
                return ` ${size} `;
              })
              .join(',');

            sizes = channelPostSizes;
          }

          if (message.message.match(BRAND_REGEX)) {
            brand = message.message
              .match(BRAND_REGEX)[0]
              .replace('#бренд_', '')
              .replace(/_/g, ' ')
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }

          isInStock = message.message.includes('#в_наявності');

          isNew = message.message.includes('#нове');
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
          mediaGroupId: mediaGroupId,
          id: messageId,
          isInStock: isInStock,
          isNew: isNew,
          brand: brand,
          sex: sex,
          size: sizes,
          itemType: itemType,
          createdAtDate: createdAtDate,
          editedAtDate: editAtDate,
        });
      });

      await sleep(5000);
    }

    const postsDataFiltered = [];
    const messagesIdsDataFiltered = [];

    ALL_DATA.forEach((message) => {
      messagesIdsDataFiltered.push({
        'message-id': message.id,
        'media-group-id': message.mediaGroupId,
      });

      if (message.isInStock) {
        postsDataFiltered.push({
          'media-group-id': message.mediaGroupId,
          'is-in-stock': message.isInStock,
          'is-new': message.isNew,
          'sex': message.sex,
          'brand': message.brand,
          'sizes': message.size,
          'type': message.itemType,
          'created-at-date': message.createdAtDate,
          'edited-at-date': message.editAtDate,
        });
      }
    });

    await saveCsvFileToDisk(
      messagesIdsCsvConfig,
      'export',
      messagesIdsDataFiltered,
    );
    await saveCsvFileToDisk(PostsCsvConfig, 'export', postsDataFiltered);
  };

  if (clientMan) {
    await scrapAllChannelPosts();
  } else {
    console.log('please login');
    return;
  }
})();
