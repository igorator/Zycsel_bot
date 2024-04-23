require('dotenv').config();
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Bot, GrammyError, HttpError } = require('grammy');
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
////////////////////////////////////////////////////////////////////////////////////
loginClient = async () => {
  await clientMan.start({
    phoneNumber: async () => await input.text('number ?'),
    password: async () => await input.text('password?'),
    phoneCode: async () => await input.text('Code ?'),
    onError: (err) => console.log(err),
  });
};

const connectClients = async () => {
  await clientMan.connect();

  await clientBot.connect();

  if (!clientMan) {
    loginClient();
  }
};

let messagesSearchQuery = '#в_наявності';

const getChannelMessages = async (quantity) => {
  return await clientMan.getMessages(channelId, {
    limit: quantity,
    filter: new Api.InputMessagesFilterPhotoVideo(),
    search: messagesSearchQuery,
  });
};

//////////////////////////////////////////////////////////////////////////////////////
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

  bot.command(
    'start',
    async (ctx) =>
      await ctx.reply(
        'привіт, на звʼязку бот Zycsel_store🦖 Тут ви можете переглянути всю наявність по брендам/розмірам тощо.',
        {
          reply_parameters: { message_id: ctx.msg.message_id },
        },
      ),
  );

  bot.command('items', async (ctx) => {
    const channelMessages = await getChannelMessages(1);

    channelMessages.forEach(async (channelMessage) => {
      if (channelMessage.message.length <= 0) {
        channelMessage.message = 'empty';
        return;
      }

      // Отправка текста сообщения
      await bot.api.sendMessage(ctx.chat.id, channelMessage.message);
    });
  });

  bot.start();
})();
