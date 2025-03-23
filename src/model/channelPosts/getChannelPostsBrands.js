const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const getChannelPostsBrands = async (itemType, isNew, size, sex) => {
  try {
    let query = supabase
      .from(TABLES.channelPosts)
      .select('brand')
      .is('is-in-stock', true)
      .eq('type', itemType);

    if (sex !== null) {
      query = query.eq('sex', sex);
    }

    if (size !== null) {
      query = query.ilike('sizes', `% ${size} %`);
    }

    if (isNew !== null) {
      query = query.eq('is-new', isNew);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching brands:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getChannelPostsBrands:', error);
    return [];
  }
};

module.exports = { getChannelPostsBrands };
