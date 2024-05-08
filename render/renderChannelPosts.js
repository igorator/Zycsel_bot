const { InputMediaBuilder } = require('grammy');
const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const renderChannelPosts = async (ctx, channelPosts) => {
  const postsToRender = [];

  for (const post of channelPosts) {
    const channelPost = [];

    const mediaTypes = await supabase
      .from(TABLES.messagesIdsTable)
      .select('id, media-type')
      .eq('media-group-id', post['media-group-id']);

    for (const type of mediaTypes.data) {
      let media;

      if (type['media-type'] === 'photo') {
        let photoUrl = await supabase.storage
          .from(TABLES.mediaStorage)
          .getPublicUrl(`${type.id}.jpg`);

        photoUrl = photoUrl.data.publicUrl;
        if (channelPost.length <= 0) {
          media = InputMediaBuilder.photo(photoUrl, {
            caption: post['post-caption'].replace(/@/g, '\n'),
          });
        } else {
          media = InputMediaBuilder.photo(photoUrl);
        }
      } else if (type['media-type'] === 'video') {
        let videoUrl = await supabase.storage
          .from(TABLES.mediaStorage)
          .getPublicUrl(`${type.id}.mp4`);

        videoUrl = videoUrl.data.publicUrl;

        if (channelPost.length <= 0) {
          media = InputMediaBuilder.video(videoUrl, {
            caption: post['post-caption'].replace(/@/g, '\n'),
          });
        } else {
          media = InputMediaBuilder.video(videoUrl);
        }
      }

      if (media) {
        channelPost.push(media);
      }
    }

    postsToRender.push(channelPost);
  }

  for (const post of postsToRender) {
    console.log(post);
    await ctx.replyWithMediaGroup(post);
    await new Promise((resolve) => setTimeout(resolve, 500));
    break;
  }
};
module.exports = { renderChannelPosts };
