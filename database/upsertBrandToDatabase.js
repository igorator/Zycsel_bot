const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const upsertBrandToDatabase = async (brand) => {
  const upsertedBrand = await supabase
    .from('Post-brands')
    .upsert({ 'brand': brand })
    .select();
};

module.exports = { upsertBrandToDatabase };
