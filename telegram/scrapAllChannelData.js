require('dotenv').config();

const {
  downloadTelegramPhoto,
  downloadTelegramVideo,
} = require('./downloadTelegramFile');

const csv = require('csvtojson');

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

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = { sleep };

(async () => {
  await clientMan.connect();

  if (!clientMan) {
    loginClient();
  }

  const PostsCsvConfig = mkConfig({
    filename: 'Posts',
    useKeysAsHeaders: true,
  });
  const mediaIdsCsvConfig = mkConfig({
    filename: 'MessagesIds',
    useKeysAsHeaders: true,
  });
  const BrandsCsvConfig = mkConfig({
    filename: 'Brands',
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
    const postsDataFiltered = [];
    const mediaIdsDataFiltered = [];
    let brandsDataFiltered = [];

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
        let mediaType = null;
        let postMessage = null;
        let isNew = null;
        let isInStock = null;
        let createdAtDate = null;
        let editAtDate = null;
        let brand = null;
        let itemType = null;
        let sizes = null;

        if (message.id) {
          messageId = message.id.toString();
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
                size = size.replace('#розмір_', '');
                return ` ${size} `;
              })
              .join(',');

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
          mediaType: mediaType,
          createdAtDate: createdAtDate,
          editedAtDate: editAtDate,
        });
      });

      await sleep(5000);
    }

    ALL_DATA.forEach((message) => {
      // Фильтрация по бренду
      if (message.brand) {
        brandsDataFiltered.push({ 'brand': message.brand });
      }

      // Фильтрация по медиа-идентификаторам
      mediaIdsDataFiltered.push({
        'id': message.id,
        'media-group-id': message.mediaGroupId,
        'media-type': message.mediaType,
      });

      // Фильтрация данных только с товарами в наличии
      if (message.isInStock) {
        postsDataFiltered.push({
          'media-group-id': message.mediaGroupId,
          'post-caption': message.postCaption,
          'is-in-stock': message.isInStock,
          'is-new': message.isNew,
          'brand': message.brand,
          'sizes': message.size,
          'type': message.itemType,
          'messages-ids': ALL_DATA.filter(
            (data) => data.mediaGroupId === message.mediaGroupId,
          )
            .map((data) => data.id)
            .join(','),
          'created-at-date': message.createdAtDate,
          'edited-at-date': message.editAtDate,
        });
      }
    });

    brandsDataFiltered = brandsDataFiltered.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.brand === value.brand),
    );

    await saveCsvFileToDisk(
      mediaIdsCsvConfig,
      'export/csv',
      mediaIdsDataFiltered,
    );
    await saveCsvFileToDisk(PostsCsvConfig, 'export/csv', postsDataFiltered);
    await saveCsvFileToDisk(BrandsCsvConfig, 'export/csv', brandsDataFiltered);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////

  const scrapAllChannelMedia = () => {
    csv()
      .fromFile('export/csv/Posts.csv')
      .then(async (posts) => {
        let messagesIds = [];
        posts.forEach((post) => {
          messagesIds.push(post['messages-ids'].split(','));
        });
        messagesIds = messagesIds
          .flat()
          .map((id) => {
            return parseInt(id);
          })
          .sort()
          .reverse()
          .splice(0, messagesIds.length);

        console.log(messagesIds.length);

        const chunkSize = 200;
        const chunks = [];
        for (let i = 0; i < messagesIds.length; i += chunkSize) {
          chunks.push(messagesIds.slice(i, i + chunkSize));
        }

        let countdown = messagesIds.length;

        async function processChunks(chunks) {
          for (const chunk of chunks) {
            const messages = await clientMan.invoke(
              new Api.channels.GetMessages({
                channel: channelId,
                id: chunk,
              }),
            );

            for (const message of messages.messages) {
              countdown -= 1;
              console.log((messagesIds.length -= 1));
              await sleep(100);

              if (message.media.photo) {
                const photo = await downloadTelegramPhoto(
                  clientMan,
                  message.media.photo,
                );

                fs.writeFile(
                  `export/media/${message.id}.jpg`,
                  Buffer.from(photo),
                  {
                    encoding: 'binary',
                    flag: 'w',
                    mode: 0o666,
                    contentType: 'image/jpg',
                  },
                  () => {},
                );
              } else if (message.media.document) {
                mediaType = 'video';
                const video = await downloadTelegramVideo(
                  clientMan,
                  message.media.document,
                );

                fs.writeFile(
                  `export/media/${message.id}.mp4`,
                  Buffer.from(video),
                  {
                    encoding: 'binary',
                    flag: 'w',
                    mode: 0o666,
                    contentType: 'video/mp4',
                  },
                  () => {},
                );
              }
            }
          }
        }

        await processChunks(chunks);
      });
  };

  await scrapAllChannelPosts();
  //await scrapAllChannelMedia();
})();
