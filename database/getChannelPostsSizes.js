const fs = require('fs').promises;

const getChannelPostsSizes = async (itemType, isNew) => {
  try {
    const data = await fs.readFile('./messages/messages.json');
    const channelPostsMessages = JSON.parse(data);

    const filteredSizes = channelPostsMessages
      .filter(
        (message) =>
          message['is-in-stock'] === true &&
          (isNew === null || message['is-new'] === isNew) &&
          (itemType === null || message['item-type'] === itemType),
      )
      .flatMap((message) => message.sizes);

    return filteredSizes;
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

module.exports = {
  getChannelPostsSizes,
};
