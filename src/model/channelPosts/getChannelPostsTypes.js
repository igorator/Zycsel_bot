const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const getChannelPostsTypes = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .select('type')
      .is('is-in-stock', true);

    if (error) {
      console.error('Error fetching types:', error);
      return [];
    }

    return data ? data.map((item) => item.type) : [];
  } catch (error) {
    console.error('Error in getChannelPostsTypes:', error);
    return [];
  }
};

module.exports = { getChannelPostsTypes };
