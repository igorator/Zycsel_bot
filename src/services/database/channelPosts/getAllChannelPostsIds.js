const { supabase } = require('../../../config/supabase.config');
const { TABLES } = require('../../../constants');

const getAllChannelPostsIds = async (itemType, isNew, size, brand) => {
  try {
    const filteredMessagesIds = [];

    let query = supabase
      .from(TABLES.channelPosts)
      .select('media-group-id')
      .eq('is-in-stock', true)
      .eq('type', itemType)
      .eq('is-new', isNew)
      .order('created-at-date', { ascending: true });

    if (size !== null) {
      query = query.ilike('sizes', `% ${size} %`);
    }

    if (brand !== null) {
      query = query.eq('brand', brand);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching channel posts:', error);
      return [];
    }

    if (data) {
      for (const mediaGroupId of data) {
        let messagesIds = await supabase
          .from(TABLES.messagesIds)
          .select('message-id')
          .eq('media-group-id', mediaGroupId['media-group-id']);

        messagesIds = messagesIds.data
          .map((messageId) => messageId['message-id'])
          .sort((a, b) => a - b);

        filteredMessagesIds.push(messagesIds);
      }
    }

    return filteredMessagesIds;
  } catch (error) {
    console.error('Error in getAllChannelPostsIds:', error);
    return [];
  }
};

module.exports = { getAllChannelPostsIds };
