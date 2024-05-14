const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getChannelPostsBrands = async (itemType, isNew, size) => {
  try {
    let query = supabase
      .from(TABLES.channelPosts)
      .select('brand')
      .eq('is-in-stock', true)
      .eq('type', itemType)
      .eq('is-new', isNew);

    if (size !== null) {
      query = query.ilike('sizes', `% ${size} %`);
    }

    const { data } = await query;

    let filteredBrands = data.map((brand) => brand.brand);

    filteredBrands = Array.from(new Set(filteredBrands));

    filteredBrands = filteredBrands.filter(
      (brand) =>
        brand !== null && brand.trim() !== 'null' && brand.trim() !== 'Null',
    );

    filteredBrands = filteredBrands.sort((a, b) => {
      if (a === `Stone Island`) return -1;
      if (b === `Stone Island`) return 1;
      if (a === `Cp Company`) return -1;
      if (b === `Cp Company`) return 1;
      return a.localeCompare(b);
    });

    return filteredBrands;
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

module.exports = {
  getChannelPostsBrands,
};
