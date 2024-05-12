CHANNEL_ID = process.env.CHANNEL_ID;

const renderChannelPosts = async (ctx, channelPosts) => {
  let postsToRender = [];
  let currentChunk = [];
  let currentChunkSize = 0;

  for (const post of channelPosts) {
    const messagesIds = post['messages-ids'];

    if (currentChunkSize + messagesIds.length > 7) {
      postsToRender.push(currentChunk);
      currentChunk = [];
      currentChunkSize = 0;
    }

    currentChunk.push(...messagesIds);
    currentChunkSize += messagesIds.length;
  }

  if (currentChunk.length > 0) {
    postsToRender.push(currentChunk);
  }

  try {
    for (let chunk of postsToRender) {
      chunk = chunk.sort((a, b) => a - b);
      await ctx.api.forwardMessages(ctx.chat.id, CHANNEL_ID, chunk);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } finally {
    ctx.reply('Наразі це всі речі за вашим запитом');
  }
};
module.exports = { renderChannelPosts };
