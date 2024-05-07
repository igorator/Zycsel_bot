const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const updatePostDataToDatabase = async (
  mediaGroupId,
  postCaption,
  createdAtDate,
  editAtDate,
  isNew,
  isInStock,
  brand,
  sizes,
  itemType,
) => {
  const { data, error } = await supabase
    .from('Zycsel-channel-posts-table')
    .upsert({
      'media-group-id': mediaGroupId,
      'post-caption': postCaption,
      'created-at-date': createdAtDate,
      'edited-at-date': editAtDate,
      'is-new': isNew,
      'is-in-stock': isInStock,
      'brand': brand,
      'sizes': sizes,
      'type': itemType,
    })
    .eq('media-group-id', mediaGroupId)
    .select();

  console.log(data, error);
};

const upsertMediaToDatabase = async (messageId, mediaGroupId, mediaType) => {
  const messageMedia = await supabase.from('Post-messages-media').upsert({
    'id': messageId,
    'media-group-id': mediaGroupId,
    'media-type': mediaType,
  });
};

module.exports = { upsertMediaToDatabase, updatePostDataToDatabase };
