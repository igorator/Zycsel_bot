const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const upsertPost = async (
  mediaGroupId,
  isInStock,
  itemType,
  isNew,
  sizes,
  brand,
  createdAtDate,
  editAtDate,
) => {
  const { data, error } = await supabase
    .from(TABLES.channelPosts)
    .upsert({
      'media-group-id': mediaGroupId,
      'is-in-stock': isInStock,
      'type': itemType,
      'is-new': isNew,
      'sizes': sizes,
      'brand': brand,
      'created-at-date': createdAtDate,
      'edited-at-date': editAtDate,
    })
    .select();

  console.log(error);
};

const upsertMessage = async (mediaGroupId, messageId) => {
  const { data, error } = await supabase
    .from(TABLES.messagesIds)
    .upsert({
      'media-group-id': mediaGroupId,
      'message-id': messageId,
    })
    .select();

  console.log(error);
};

module.exports = { upsertMessage, upsertPost };
