const fs = require('fs').promises;

const getChannelPostsBrands = async (itemType, isNew, size) => {
  try {
    const data = await fs.readFile('./messages/messages.json');
    const channelPostsMessages = JSON.parse(data);

    let filteredBrands = channelPostsMessages
      .filter(
        (message) =>
          message['is-in-stock'] === true &&
          (itemType === null || message['item-type'] === itemType) &&
          (isNew === null || message['is-new'] === isNew) &&
          (size === null || message['sizes'].includes(size)),
      )
      .flatMap((message) => message.brand);

    filteredBrands = Array.from(new Set(filteredBrands));

    filteredBrands = filteredBrands.filter(
      (brand) =>
        brand !== null && brand.trim() !== 'null' && brand.trim() !== 'Null',
    );

    filteredBrands = filteredBrands.sort((a, b) => {
      if (a === `Stone Island`) return -1;
      if (b === `Stone Island`) return 1;
      if (a === `Cp Company`) return -1;
      if (b === `Cp Company`) return 1;
      return a.localeCompare(b);
    });

    return filteredBrands;
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

module.exports = {
  getChannelPostsBrands,
};
