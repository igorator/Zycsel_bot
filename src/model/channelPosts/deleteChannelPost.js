const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const deletePost = async (mediaGroupId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .delete()
      .eq('media-group-id', mediaGroupId);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    console.log('deleted post', data);

    return true;
  } catch (error) {
    console.error('Error in deletePost:', error);
    return false;
  }
};

module.exports = { deletePost };
