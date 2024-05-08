const { createClient } = require('@supabase/supabase-js');
const { TABLES } = require('../components/constants');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadPhotoToStorage = async (ctx, id) => {
  const photo = await ctx.getFile();
  const photoUrl = await photo.getUrl();
  let photoFile = await fetch(photoUrl);
  photoFile = Buffer.from(await photoFile.arrayBuffer());

  const sendedPhoto = await supabase.storage
    .from(TABLES.mediaStorage)
    .upload(`/${id}.jpg`, photoFile, {
      cacheControl: '3600',
      contentType: 'image/jpg',
    });
};

const uploadVideoToStorage = async (ctx, id) => {
  const video = await ctx.getFile();
  const videoUrl = await video.getUrl();
  let videoFile = await fetch(videoUrl);
  videoFile = Buffer.from(await videoFile.arrayBuffer());

  const sendedVideo = await supabase.storage
    .from(TABLES.mediaStorage)
    .upload(`/${id}.mp4`, videoFile, {
      cacheControl: '3600',
      contentType: 'video/mp4',
    });
};

module.exports = { uploadPhotoToStorage, uploadVideoToStorage };
