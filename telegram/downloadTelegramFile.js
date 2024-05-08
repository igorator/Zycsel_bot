const { Api } = require('telegram');

const downloadTelegramPhoto = async (client, photo) => {
  const photoFile = await client.invoke(
    new Api.upload.GetFile({
      location: new Api.InputPhotoFileLocation({
        fileReference: photo.fileReference,
        id: photo.id,
        accessHash: photo.accessHash,
        thumbSize: photo.sizes.find(
          (size) => size.className === 'PhotoSizeProgressive',
        ).type,
      }),
      precise: false,
      offset: 0,
      limit: 1024 * 1024,
    }),
  );

  return photoFile.bytes;
};

const downloadTelegramVideo = async (client, video) => {
  const videoInfo = video;

  const fileSize = videoInfo.size;

  let videoBuffer = Buffer.alloc(0);

  const chunkSize = 1024 * 1024;

  const numChunks = Math.ceil(fileSize / chunkSize);

  for (let i = 0; i < numChunks; i++) {
    const offset = i * chunkSize;
    const chunk = await client.invoke(
      new Api.upload.GetFile({
        location: new Api.InputDocumentFileLocation({
          id: videoInfo.id,
          fileReference: videoInfo.fileReference,
          accessHash: videoInfo.accessHash,
          thumbSize: '',
        }),
        precise: false,
        limit: chunkSize,
        offset: offset,
      }),
    );

    videoBuffer = Buffer.concat([videoBuffer, chunk.bytes]);
  }
  return videoBuffer;
};

module.exports = { downloadTelegramPhoto, downloadTelegramVideo };
