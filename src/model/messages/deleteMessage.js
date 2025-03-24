const { supabase } = require('../../config/supabase.config');
const { TABLES } = require('../../constants');

const deleteMessage = async (mediaGroupId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.messagesIds)
      .delete()
      .eq('media-group-id', mediaGroupId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    return false;
  }
};

module.exports = { deleteMessage };
