require('dotenv').config();

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

const stringSessionMan = new StringSession(
  process.env.TELEGRAM_STRING_SESSION_MAN,
);

const apiId = +process.env.TELEGRAM_APP_ID;
const apiHash = process.env.TELEGRAM_API_HASH;

const clientMan = new TelegramClient(stringSessionMan, apiId, apiHash, {
  connectionRetries: 5,
});

loginClient = async () => {
  await clientMan.start({
    phoneNumber: async () => await input.text('number ?'),
    password: async () => await input.text('password?'),
    phoneCode: async () => await input.text('Code ?'),
    onError: (err) => console.error(err),
  });
};

await clientMan.connect();

if (!clientMan) {
  loginClient();
}

////////////////////////////////////////////////////////////////////////////////////////////
// const getAllChannelPosts = async (
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
