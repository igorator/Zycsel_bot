const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const deletePost = async (mediaGroupId) => {
  const { data, error } = await supabase
    .from(TABLES.channelPosts)
    .delete()
    .eq('media-group-id', mediaGroupId);

  if (error) {
    console.error('Error upserting post:', error);
  } else {
    console.log('Deleted post:', data);
  }
};

const deteleMessage = async (mediaGroupId) => {
  const { data, error } = await supabase
    .from(TABLES.messagesIds)
    .delete()
    .eq('media-group-id', mediaGroupId);

  if (error) {
    console.error('Error upserting message:', error);
  } else {
    console.log('Deleted message data:', data);
  }
};

module.exports = { deletePost, deteleMessage };
