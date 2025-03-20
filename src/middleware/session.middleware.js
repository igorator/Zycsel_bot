const { session } = require('grammy');
const { ITEMS } = require('../constants/items');

function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

const sessionMiddleware = session({
  initial: () => ({
    screen: null,
    isNew: null,
    size: null,
    brand: null,
    type: ITEMS.clothes.name,
    postsOffset: 0,
  }),
});

module.exports = {
  getSessionKey,
  sessionMiddleware,
};
