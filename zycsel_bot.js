require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram/tl');

const { Bot, GrammyError, HttpError } = require('grammy');
const apiId = +process.env.TELEGRAM_APP_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const botAuthToken = process.env.BOT_AUTH_TOKEN;
const stringSession = process.env.TELEGRAM_STRING_SESSION;

(async () => {
  const client = new TelegramClient(
    new StringSession(stringSession),
    apiId,
    apiHash,
    { connectionRetries: 5 },
  );
  await client.start({
    botAuthToken: botAuthToken,
  });
  console.log(client.session.save());
})();

//Create a new bot
const bot = new Bot(botAuthToken);

bot.command(
  'start',
  async (ctx) =>
    await ctx.reply('Вітаю, який одяг вас цікавить?', {
      reply_parameters: { message_id: ctx.msg.message_id },
    }),
);

bot.on('message', async (ctx) => ctx.reply('яннннн'));

bot.catch;
(err) => {
  const errorContext = err.ctx;
  console.error(`Помилка ${errorContext.update.update_id}`);
  const error = err.error;

  if (error instanceof GrammyError) {
    console.error('Помилка в запиті:', error.description);
  } else if (error instanceof HttpError) {
    console.error('Невідома помилка:', error);
  }
};

bot.start();
