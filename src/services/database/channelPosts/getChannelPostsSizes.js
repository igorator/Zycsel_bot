const { supabase } = require('../../../config/supabase.config');
const { TABLES, ITEMS } = require('../../../constants');
const { filterCountSizes } = require('../../../helpers/sizes/filterCountSizes');

const getChannelPostsSizes = async (itemType, isNew) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .select('sizes')
      .eq('is-in-stock', true)
      .eq('type', itemType)
      .eq('is-new', isNew);

    if (error) {
      console.error('Error fetching sizes:', error);
      return [];
    }

    const formattedSizes = data.map((item) => item.sizes.trim());

    let filterCountedSizes = [];

    if (itemType === ITEMS.clothes.name)
      filterCountedSizes = filterCountSizes(
        formattedSizes,
        ITEMS.clothes.sizes,
      );

    if (itemType === ITEMS.shoes.name)
      filterCountedSizes = filterCountSizes(formattedSizes, ITEMS.shoes.sizes);

    if (itemType === ITEMS.parfumes.name)
      filterCountedSizes = filterCountSizes(
        formattedSizes,
        ITEMS.parfumes.sizes,
      );

    console.log(data, error);

    return filterCountedSizes;
  } catch (error) {
    console.error('Error in getChannelPostsSizes:', error);
    return [];
  }
};

module.exports = { getChannelPostsSizes };
