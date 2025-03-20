const { KEYBOARDS } = require('../../constants/keyboards');
const {
  getChannelPostsTypes,
} = require('../database/channelPosts/getChannelPostsTypes');

const renderTypeSelection = async (ctx) => {
  const typeCounts = await getChannelPostsTypes();

  const typeButtons = KEYBOARDS.typeSelection.map((row) =>
    row.map((type) => `${type} (${typeCounts[type] || 0})`),
  );

  await ctx.reply('Оберіть тип речей:', {
    reply_markup: {
      keyboard: typeButtons,
      resize_keyboard: true,
    },
  });
};

module.exports = { renderTypeSelection };
