const express = require('express');
const { run } = require('@grammyjs/runner');
const bot = require('./config/bot.config');
const { sessionMiddleware } = require('./middleware/session.middleware');
const {
  throttler,
  rateLimiter,
  sequentialMiddleware,
  autoRetry,
} = require('./middleware/throttler.middleware');

const { setupStartHandler } = require('./handlers/start.command');
const {
  setupTypeHandlers,
  setupQualityHandlers,
  setupSizeHandlers,
  setupBrandHandlers,
  setupAdditionalHandlers,
  setupNavigationHandlers,
} = require('./handlers/messages');
const setupChannelPostHandler = require('./handlers/posts/channel.messages');
const setupEditedPostHandler = require('./handlers/posts/edited.messages');

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

setupStartHandler(bot);
setupTypeHandlers(bot);
setupQualityHandlers(bot);
setupSizeHandlers(bot);
setupBrandHandlers(bot);
setupAdditionalHandlers(bot);
setupNavigationHandlers(bot);
setupChannelPostHandler(bot);
setupEditedPostHandler(bot);

const runner = run(bot);

const stopRunner = () => runner.isRunning() && runner.stop();
process.once('SIGINT', stopRunner);
process.once('SIGTERM', stopRunner);
