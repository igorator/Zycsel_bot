const {
  downloadTelegramPhoto,
  downloadTelegramVideo,
} = require('./downloadTelegramFile');

const csv = require('csvtojson');

const fs = require('fs');

const { TelegramClient, Api } = require('telegram');

const { StringSession } = require('telegram/sessions');

const apiId = +process.env.TELEGRAM_APP_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const channelId = process.env.CHANNEL_USERNAME;

const stringSessionMan = new StringSession(
  process.env.TELEGRAM_STRING_SESSION_MAN,
);

const clientMan = new TelegramClient(stringSessionMan, apiId, apiHash, {
  connectionRetries: 5,
});

loginClient = async () => {
  await clientMan.start({
    phoneNumber: async () => await input.text('number ?'),
    password: async () => await input.text('password?'),
    phoneCode: async () => await input.text('code ?'),
    onError: (err) => console.error(err),
  });
};

(async () => {
  await clientMan.connect();

  if (!clientMan) {
    loginClient();
  }

  csv()
    .fromFile('export/csv/Posts.csv')
    .then(async (posts) => {
      let messagesIds = [];
      posts.forEach((post) => {
        messagesIds.push(post['messages-ids'].split(', '));
      });
      messagesIds = messagesIds
        .flat()
        .map((id) => {
          return parseInt(id);
        })
        .sort()
        .reverse();

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
              console.log(photo);
              fs.writeFile(
                `export/media/${message.id}.jpg`,
                Buffer.from(photo),
                () => {},
              );
            } else if (message.media.document) {
              mediaType = 'video';
              const video = await downloadTelegramVideo(
                clientMan,
                message.media.document,
              );
              console.log(video);
              fs.writeFile(
                `export/media/${message.id}.mp4`,
                Buffer.from(video),
                () => {},
              );
            }
          }
        }
      }

      await processChunks(chunks);
    });
})();
