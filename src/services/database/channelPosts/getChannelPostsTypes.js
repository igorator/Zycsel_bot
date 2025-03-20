const { supabase } = require('../../../config/supabase.config');
const { TABLES } = require('../../../constants');
const { capitalize } = require('../../../helpers/capitalize');

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

    if (!data) {
      return [];
    }

    const typeCounts = data.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(
      ([type, count]) => `${capitalize(type)} (${count})`,
    );
  } catch (error) {
    console.error('Error in getChannelPostsTypes:', error);
    return [];
  }
};

module.exports = { getChannelPostsTypes };
