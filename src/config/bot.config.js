require('dotenv').config();
const { Bot, GrammyError, HttpError } = require('grammy');

const BOT_AUTH_TOKEN = process.env.BOT_AUTH_TOKEN;
if (!BOT_AUTH_TOKEN) throw new Error('BOT_TOKEN не встановлено');

const bot = new Bot(BOT_AUTH_TOKEN, {
  botInfo: {
    id: 7154152032,
    is_bot: true,
    first_name: 'Zycsel store bot',
    username: 'zycsel_bot',
    can_join_groups: true,
    can_read_all_group_messages: true,
    supports_inline_queries: false,
  },
});

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

module.exports = bot;
