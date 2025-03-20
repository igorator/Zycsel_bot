const moment = require('moment');
const { ITEMS } = require('../../constants/items');
const { SIZE_REGEX, BRAND_REGEX } = require('../../constants/regex');
const { upsertPost, upsertMessage } = require('../../services/database');

const setupChannelPostHandler = (bot) => {
  bot.on('channel_post:media', async (ctx) => {
    const channelPostData = ctx.update.channel_post;

    let messageId = null;
    let mediaGroupId = null;

    if (channelPostData.media_group_id) {
      mediaGroupId = channelPostData.media_group_id;
    }

    if (channelPostData.message_id) {
      messageId = channelPostData.message_id;
    }

    if (channelPostData.caption) {
      let isNew = null;
      let isInStock = null;
      let createdAtDate = null;
      let editedAtDate = null;
      let brand = null;
      let itemType = null;
      let sizes = [];

      if (channelPostData.caption.includes(`#${ITEMS.shoes.name}`)) {
        itemType = ITEMS.shoes.name;
      } else if (
        channelPostData.caption.includes(`#${ITEMS.accessories.name}`)
      ) {
        itemType = ITEMS.accessories.name;
      } else if (channelPostData.caption.includes(`#${ITEMS.parfumes.name}`)) {
        itemType = ITEMS.parfumes.name;
      } else itemType = ITEMS.clothes.name;

      if (channelPostData.caption.match(SIZE_REGEX)) {
        const channelPostSizes = channelPostData.caption
          .match(SIZE_REGEX)
          .map((size) => {
            size = size.replace('#розмір_', '');
            if (itemType === ITEMS.shoes.name) {
              size = size.replace('_', '.');
            } else if (itemType === ITEMS.parfumes.name) {
              size = size.replace('_', ' ');
              size = size.charAt(0).toUpperCase() + size.slice(1);
            }

            return ` ${size} `;
          })
          .join(',');

        sizes = channelPostSizes;
      }

      if (channelPostData.caption.match(BRAND_REGEX)) {
        brand = channelPostData.caption
          .match(BRAND_REGEX)[0]
          .replace('#бренд_', '')
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      isInStock = channelPostData.caption.includes('#в_наявності');

      if (itemType === ITEMS.shoes.name || itemType === ITEMS.parfumes.name) {
        isNew = true;
      } else {
        isNew = channelPostData.caption.includes('#нове');
      }

      if (channelPostData.date) {
        createdAtDate = moment
          .unix(channelPostData.date)
          .utc()
          .format('YYYY-MM-DD HH:mm:ssZ');
      }

      await upsertPost(
        mediaGroupId,
        isInStock,
        itemType,
        isNew,
        sizes,
        brand,
        createdAtDate,
        editedAtDate,
      );
    }

    await upsertMessage(mediaGroupId, messageId);
  });
};

module.exports = setupChannelPostHandler;
