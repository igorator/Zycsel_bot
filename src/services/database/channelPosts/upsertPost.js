const { supabase } = require('../../../config/supabase.config');
const { TABLES } = require('../../../constants');

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
  try {
    const { data, error } = await supabase
      .from(TABLES.channelPosts)
      .upsert(
        {
          'media-group-id': mediaGroupId,
          'is-in-stock': isInStock,
          'type': itemType,
          'is-new': isNew,
          'sizes': sizes,
          'brand': brand,
          'created-at-date': createdAtDate,
          'edited-at-date': editAtDate,
        },
        {
          onConflict: ['media-group-id'],
          ignoreDuplicates: false,
        },
      )
      .select();

    if (error) {
      console.error('Error upserting post:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertPost:', error);
    return null;
  }
};

module.exports = { upsertPost };
