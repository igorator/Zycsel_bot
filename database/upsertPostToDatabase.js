const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const upsertPostToDatabase = async (
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
    .select();
};

const upsertMediaToDatabase = async (
  messageId,
  mediaGroupId,
  postMedia,
  mediaType,
) => {
  const { data, error } = await supabase
    .from('Post-media')
    .upsert({
      'id': messageId,
      'media-group-id': mediaGroupId,
      'media-files': postMedia,
      'media-type': mediaType,
    })
    .select();
};

module.exports = { upsertMediaToDatabase, upsertPostToDatabase };
