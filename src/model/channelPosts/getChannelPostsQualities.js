const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const getChannelPostsQualities = async (itemType, sex) => {
  try {
    const query = supabase
      .from(TABLES.channelPosts)
      .select('is-new')
      .is('is-in-stock', true)
      .eq('type', itemType);

    if (sex !== null) {
      query.eq('sex', sex);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quality:', error);
      return { new: 0, used: 0 };
    }

    if (!data) {
      return { new: 0, used: 0 };
    }

    return data;
  } catch (error) {
    console.error('Error in getChannelPostsQualities:', error);
    return { new: 0, used: 0 };
  }
};

module.exports = { getChannelPostsQualities };
