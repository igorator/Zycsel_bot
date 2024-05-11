CHANNEL_ID = process.env.CHANNEL_ID;

const renderChannelPosts = async (ctx, channelPosts) => {
  console.log(channelPosts);

  let postsToRender = [];
  let currentChunk = [];
  let currentChunkSize = 0;

  for (const post of channelPosts) {
    const messagesIds = post['messages-ids'];

    // Если добавление этих сообщений приведет к превышению лимита в 30, создаем новый чанк
    if (currentChunkSize + messagesIds.length > 25) {
      postsToRender.push(currentChunk); // Добавляем текущий чанк
      currentChunk = []; // Обнуляем текущий чанк
      currentChunkSize = 0;
    }

    currentChunk.push(...messagesIds); // Добавляем сообщения в текущий чанк
    currentChunkSize += messagesIds.length; // Обновляем размер текущего чанка
  }

  // Добавляем последний чанк, если он не пустой
  if (currentChunk.length > 0) {
    postsToRender.push(currentChunk);
  }

  // Отправляем чанки сообщений
  try {
    for (let chunk of postsToRender) {
      chunk = chunk.sort((a, b) => a - b);
      ctx.api.forwardMessages(ctx.chat.id, CHANNEL_ID, chunk);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } finally {
    ctx.reply('Це всі речі за вашим запитом');
  }
};
module.exports = { renderChannelPosts };
