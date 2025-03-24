const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const getChannelPostsSex = async (itemType) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .select('sex')
      .is('is-in-stock', true)
      .eq('type', itemType);

    if (error) {
      console.error('Error fetching sex distribution:', error);
      return { man: 0, woman: 0, unisex: 0 };
    }

    if (!data) {
      return { man: 0, woman: 0, unisex: 0 };
    }

    return data;
  } catch (error) {
    console.error('Error in getChannelPostsSex:', error);
    return { man: 0, woman: 0, unisex: 0 };
  }
};

module.exports = { getChannelPostsSex };
