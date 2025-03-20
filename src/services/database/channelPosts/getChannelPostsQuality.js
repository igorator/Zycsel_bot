const { supabase } = require('../../../config/supabase.config');
const { TABLES } = require('../../../constants');

const getChannelPostsQuality = async (itemType) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .select('is-new')
      .is('is-in-stock', true)
      .eq('type', itemType);

    if (error) {
      console.error('Error fetching quality:', error);
      return { new: 0, used: 0 };
    }

    if (!data) {
      return { new: 0, used: 0 };
    }

    const qualityCounts = data.reduce(
      (acc, item) => {
        if (item['is-new']) {
          acc.new++;
        } else {
          acc.used++;
        }
        return acc;
      },
      { new: 0, used: 0 },
    );

    return qualityCounts;
  } catch (error) {
    console.error('Error in getChannelPostsQuality:', error);
    return { new: 0, used: 0 };
  }
};

module.exports = { getChannelPostsQuality };
