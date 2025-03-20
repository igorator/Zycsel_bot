const { supabase } = require('../../../config/supabase.config');
const { TABLES } = require('../../../constants');
const {
  filterCountBrands,
} = require('../../../helpers/brands/filterCountBrands');
const { sortBrands } = require('../../../helpers/brands/sortBrands');

const getChannelPostsBrands = async (itemType, isNew, size) => {
  try {
    let query = supabase
      .from(TABLES.channelPosts)
      .select('brand')
      .is('is-in-stock', true)
      .eq('type', itemType);

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

    let formattedBrands = data.map((item) => item.brand).filter(Boolean);

    let countedBrands = filterCountBrands(formattedBrands);
    let sortedBrands = sortBrands(countedBrands);

    return sortedBrands;
  } catch (error) {
    console.error('Error in getChannelPostsBrands:', error);
    return [];
  }
};

module.exports = { getChannelPostsBrands };
