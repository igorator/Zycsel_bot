const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const getChannelPosts = async (isNew, type, size, brand) => {
  let query = supabase
    .from(TABLES.postsTable)
    .select('*')
    .eq('is-in-stock', true)
    .eq('is-new', isNew)
    .eq('type', type)
    .order('created-at-date', { ascending: true });

  if (brand !== '') {
    query = query.eq('brand', brand);
  }

  if (size !== '') {
    query = query.ilike('sizes', `% ${size} %`);
  }

  const { data, error } = await query;

  return data;
};

module.exports = { getChannelPosts };
