require('dotenv').config();

const { Bot, GrammyError, HttpError } = require('grammy');

//Create a new bot
const bot = new Bot(process.env.API_KEY_BOT);

bot.command('start', (ctx) => ctx.reply('Вітаю, який одяг вас цікавить?'));

bot.on('message', (ctx) => ctx.reply('яннннн'));

bot.catch;
(error) => {
  const errorContext = error.ctx;
  console.error(`Помилка ${errorContext.update.update_id}`);
  const error = error.error;

  if (error instanceof GrammyError) {
    console.error('Помилка в запиті:', error.description);
  } else if (error instanceof HttpError) {
    console.error('Невідома помилка:', error);
  }
};

bot.start();
