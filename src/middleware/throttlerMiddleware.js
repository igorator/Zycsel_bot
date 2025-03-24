const { limit } = require('@grammyjs/ratelimiter');
const { apiThrottler } = require('@grammyjs/transformer-throttler');
const { autoRetry } = require('@grammyjs/auto-retry');
const { sequentialize } = require('@grammyjs/runner');
const { getSessionKey } = require('./sessionMiddleware');

const throttler = apiThrottler({
  global: {
    maxConcurrent: 10,
    minTime: 500,
  },
});

const rateLimiter = limit();
const sequentialMiddleware = sequentialize(getSessionKey);

module.exports = {
  throttler,
  rateLimiter,
  sequentialMiddleware,
  autoRetry,
};
