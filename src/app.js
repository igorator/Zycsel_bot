const express = require('express');
const { run } = require('@grammyjs/runner');
const bot = require('./config/bot.config');
const { sessionMiddleware } = require('./middleware/sessionMiddleware');
const {
  throttler,
  rateLimiter,
  sequentialMiddleware,
  autoRetry,
} = require('./middleware/throttlerMiddleware');

const { setupControllers } = require('./controllers');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});

bot.use(sessionMiddleware);
bot.use(sequentialMiddleware);
bot.use(rateLimiter);
bot.api.config.use(autoRetry());
bot.api.config.use(throttler);

setupControllers(bot);

const runner = run(bot);

const stopRunner = () => runner.isRunning() && runner.stop();
process.once('SIGINT', stopRunner);
process.once('SIGTERM', stopRunner);
