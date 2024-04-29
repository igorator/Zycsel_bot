const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const getChannelPosts = async (isNew, type, size, brand) => {
  let query = supabase
    .from('Zycsel-channel-posts-table')
    .select('*')
    .eq('is-in-stock', true)
    .eq('is-new', isNew)
    .eq('type', type);

  if (brand !== '') {
    query = query.eq('brand', brand);
  }

  if (size !== '') {
    query = query.contains('sizes', [size]);
  }

  const { data, error } = await query;

  return data;
};

module.exports = { getChannelPosts };
