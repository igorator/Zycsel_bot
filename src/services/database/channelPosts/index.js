const { getAllChannelPostsIds } = require('./getAllChannelPostsIds');
const { getChannelPostsBrands } = require('./getChannelPostsBrands');
const { getChannelPostsSizes } = require('./getChannelPostsSizes');
const { upsertPost } = require('./upsertPost');
const { deletePost } = require('./deletePost');
const { getChannelPostsTypes } = require('./getChannelPostsTypes');
const { getChannelPostsQuality } = require('./getChannelPostsQuality');

module.exports = {
  getAllChannelPostsIds,
  getChannelPostsBrands,
  getChannelPostsSizes,
  upsertPost,
  deletePost,
  getChannelPostsTypes,
  getChannelPostsQuality,
};
