const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

CHANNEL_ID = process.env.CHANNEL_ID;

const renderChannelPosts = async (ctx, channelPosts) => {
  let postsToRender = [];
  let currentChunk = []; // Создаем массив для текущего чанка
  let currentChunkSize = 0;

  for (const post of channelPosts) {
    let messagesIds = await supabase
      .from(TABLES.messagesIdsTable)
      .select('id, media-group-id')
      .eq('media-group-id', post['media-group-id']);

    messagesIds = messagesIds.data
      .map((message) => parseInt(message.id))
      .sort();

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
    for (const chunk of postsToRender) {
      ctx.api.forwardMessages(ctx.chat.id, CHANNEL_ID, chunk);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } finally {
    ctx.reply('Це всі речі за вашим запитом');
  }
};
module.exports = { renderChannelPosts };
