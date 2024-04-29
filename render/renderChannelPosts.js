const { InputMediaBuilder } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const renderChannelPosts = async (ctx, channelPosts) => {
  channelPosts.forEach(async (post) => {
    const mediaGroupItems = [];

    const postMedia = await supabase
      .from('Post-media')
      .select('media-files, media-type')
      .eq('media-group-id', post['media-group-id']);

    postMedia.data.forEach((media, index) => {
      if (media['media-type'] === 'photo') {
        if (index === 0) {
          mediaGroupItems.push(
            InputMediaBuilder.photo(media['media-files'], {
              caption: post['post-caption'],
            }),
          );
        }
        mediaGroupItems.push(InputMediaBuilder.photo(media['media-files']));
      } else if (media['media-type'] === 'video') {
        if (index === 0) {
          mediaGroupItems.push(
            InputMediaBuilder.video(media['media-files'], {
              caption: post['post-caption'],
            }),
          );
        }
        mediaGroupItems.push(InputMediaBuilder.video(media['media-files']));
      }
    });
    ctx.replyWithMediaGroup(mediaGroupItems);
  });
};

module.exports = { renderChannelPosts };
