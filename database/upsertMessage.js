const fs = require('fs').promises;

const upsertMessage = async (
  mediaGroupId,
  messageId,
  isInStock,
  itemType,
  isNew,
  sizes,
  brand,
  createdAtDate,
  editAtDate,
) => {
  try {
    // Читаем данные из файла
    const data = await fs.readFile('./messages/messages.json');
    let channelPostsMessages = JSON.parse(data);

    // Проверяем, существует ли сообщение с таким messageId
    const existingIndex = channelPostsMessages.findIndex(
      (msg) => msg.messageId === messageId,
    );

    if (existingIndex !== -1) {
      // Если сообщение существует, обновляем его
      channelPostsMessages[existingIndex] = {
        mediaGroupId,
        messageId,
        isInStock,
        itemType,
        isNew,
        sizes,
        brand,
        createdAtDate,
        editAtDate,
      };
    } else {
      // Если сообщение не существует, добавляем новое
      channelPostsMessages.unshift({
        mediaGroupId,
        messageId,
        isInStock,
        itemType,
        isNew,
        sizes,
        brand,
        createdAtDate,
        editAtDate,
      });
    }

    // Записываем обновленные данные обратно в файл
    await fs.writeFile(
      './messages/messages.json',
      JSON.stringify(channelPostsMessages, null, 2),
    );
  } catch (error) {
    console.error('Error updating message:', error);
  }
};

module.exports = { upsertMessage };
