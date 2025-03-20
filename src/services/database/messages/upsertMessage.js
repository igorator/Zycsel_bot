const { supabase } = require('../../../config/supabase.config');
const { TABLES } = require('../../../constants');

const upsertMessage = async (mediaGroupId, messageId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.messagesIds)
      .upsert(
        {
          'media-group-id': mediaGroupId,
          'message-id': messageId,
        },
        {
          onConflict: ['message-id'],
          ignoreDuplicates: false,
        },
      )
      .select();

    if (error) {
      console.error('Error upserting message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertMessage:', error);
    return null;
  }
};

module.exports = { upsertMessage };
