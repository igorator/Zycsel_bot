const fs = require('fs').promises;

const getAllChannelPosts = async (itemType, isNew, size, brand) => {
  try {
    const data = await fs.readFile('./messages/messages.json');
    const channelPostsMessages = JSON.parse(data);

    const posts = [];
    for (const message of channelPostsMessages) {
      const mediaGroupId = message['media-group-id'];
      let post = posts.find((p) => p['media-group-id'] === mediaGroupId);
      if (!post) {
        post = {
          'media-group-id': mediaGroupId,
          'messages-ids': [],
        };
        posts.push(post);
      }
      post['messages-ids'].push(message['message-id']);
      if (message['is-in-stock'] !== null) {
        post['is-in-stock'] = message['is-in-stock'];
      }
      if (message['item-type'] !== null) {
        post['item-type'] = message['item-type'];
      }
      if (message['is-new'] !== null) {
        post['is-new'] = message['is-new'];
      }
      if (message['brand'] !== null) {
        post['brand'] = message['brand'];
      }
      if (message['sizes'].length > 0) {
        post['sizes'] = message['sizes'];
      }
      if (message['created-at-date'] !== null) {
        post['created-at-date'] = message['created-at-date'];
      }
      if (message['edited-at-date'] !== null) {
        post['edited-at-date'] = message['edited-at-date'];
      }
    }

    const filteredChannelPosts = posts.filter((post) => {
      return (
        post['is-in-stock'] === true &&
        (itemType === null || post['item-type'] === itemType) &&
        (isNew === null || post['is-new'] === isNew) &&
        (size === null || post['sizes'].includes(size)) &&
        (brand === null || post['brand'] === brand)
      );
    });

    return filteredChannelPosts;
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

module.exports = {
  getAllChannelPosts,
};
