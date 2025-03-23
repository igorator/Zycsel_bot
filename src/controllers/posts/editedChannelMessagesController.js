const moment = require('moment');
const { ITEMS } = require('../../constants/items');
const { SIZE_REGEX, BRAND_REGEX, SEX_REGEX } = require('../../constants/regex');
const {
  upsertPost,
  upsertMessage,
  deletePost,
} = require('../../model/channelPosts');

const setupEditedPostController = (bot) => {
  bot.on('edited_channel_post:media', async (ctx) => {
    const editedChannelPostData = ctx.update.edited_channel_post;

    let messageId;
    let mediaGroupId;

    if (editedChannelPostData.message_id) {
      messageId = editedChannelPostData.message_id;
    }

    if (editedChannelPostData.media_group_id) {
      mediaGroupId = editedChannelPostData.media_group_id;
    }

    if (editedChannelPostData.caption) {
      let isNew = null;
      let isInStock = null;
      let createdAtDate = null;
      let editedAtDate = null;
      let brand = null;
      let itemType = null;
      let sex = null;
      let sizes = [];

      if (editedChannelPostData.caption.includes(`#${ITEMS.shoes.name}`)) {
        itemType = ITEMS.shoes.name;
      } else if (
        editedChannelPostData.caption.includes(`#${ITEMS.accessories.name}`)
      ) {
        itemType = ITEMS.accessories.name;
      } else if (
        editedChannelPostData.caption.includes(`#${ITEMS.parfumes.name}`)
      ) {
        itemType = ITEMS.parfumes.name;
      } else {
        itemType = ITEMS.clothes.name;
      }

      if (editedChannelPostData.caption.match(SEX_REGEX)) {
        sex = editedChannelPostData.caption
          .match(SEX_REGEX)[0]
          .replace('#стать_', '');
      }

      if (editedChannelPostData.caption.match(SIZE_REGEX)) {
        const channelPostSizes = editedChannelPostData.caption
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

      if (editedChannelPostData.caption.match(BRAND_REGEX)) {
        brand = editedChannelPostData.caption
          .match(BRAND_REGEX)[0]
          .replace('#бренд_', '')
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      isInStock = editedChannelPostData.caption.includes('#в_наявності');

      if (itemType === ITEMS.shoes.name || itemType === ITEMS.parfumes.name) {
        isNew = true;
      } else {
        isNew = editedChannelPostData.caption.includes('#нове');
      }

      if (editedChannelPostData.date) {
        createdAtDate = moment
          .unix(editedChannelPostData.date)
          .utc()
          .format('YYYY-MM-DD HH:mm:ssZ');
      }

      if (editedChannelPostData.edit_date) {
        editedAtDate = moment
          .unix(editedChannelPostData.edit_date)
          .utc()
          .format('YYYY-MM-DD HH:mm:ssZ');
      }

      if (isInStock) {
        await upsertPost(
          mediaGroupId,
          isInStock,
          itemType,
          sex,
          isNew,
          sizes,
          brand,
          createdAtDate,
          editedAtDate,
        );
      } else {
        deletePost(mediaGroupId);
      }
    }

    await upsertMessage(mediaGroupId, messageId);
  });
};

module.exports = { setupEditedPostController };
