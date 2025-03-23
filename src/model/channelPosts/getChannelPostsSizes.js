const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const getChannelPostsSizes = async (itemType, isNew, sex) => {
  try {
    let query = supabase
      .from(TABLES.channelPosts)
      .select('sizes')
      .eq('is-in-stock', true)
      .eq('type', itemType)
      .eq('is-new', isNew);

    if (sex !== null) {
      query = query.eq('sex', sex);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sizes:', error);
      return [];
    }

    if (!data.length) {
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getChannelPostsSizes:', error);
    return [];
  }
};

module.exports = { getChannelPostsSizes };
