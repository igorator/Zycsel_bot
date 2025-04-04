const { getChannelPostsIds } = require('./getChannelPostsIds');
const { getChannelPostsBrands } = require('./getChannelPostsBrands');
const { getChannelPostsSizes } = require('./getChannelPostsSizes');
const { getChannelPostsTypes } = require('./getChannelPostsTypes');
const { getChannelPostsQualities } = require('./getChannelPostsQualities');
const { getChannelPostsSex } = require('./getChannelPostsSex');
const { upsertPost } = require('./upsertPost');
const { deletePost } = require('./deleteChannelPost');
const { upsertMessage } = require('./upsertMessage');

module.exports = {
  getChannelPostsTypes,
  getChannelPostsIds,
  getChannelPostsBrands,
  getChannelPostsSizes,
  getChannelPostsQualities,
  getChannelPostsSex,
  upsertPost,
  upsertMessage,
  deletePost,
};
