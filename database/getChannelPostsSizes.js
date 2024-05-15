const { TABLES } = require('../components/constants');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getChannelPostsSizes = async (itemType, isNew) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .select('sizes')
      .eq('is-in-stock', true)
      .eq('type', itemType)
      .eq('is-new', isNew);

    console.log(error);

    const filteredSizes = data.map((size) =>
      size.sizes.trim().replace('_', '.'),
    );

    return filteredSizes;
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

module.exports = {
  getChannelPostsSizes,
};
