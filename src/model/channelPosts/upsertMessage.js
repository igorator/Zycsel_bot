const { TABLES } = require('../../constants/tables');
const { supabase } = require('../../config/supabase.config');

const upsertMessage = async (mediaGroupId, messageId) => {
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
  } else {
    console.log('Upserted message data:', data);
  }
};

module.exports = { upsertMessage };
