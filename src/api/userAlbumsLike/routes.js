const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{id}/likes",
    handler: (request, h) => handler.postUserAlbumLikeHandler(request, h),
    options: {
      auth: "music_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/albums/{id}/likes",
    handler: (request, h) => handler.deleteUserAlbumLikeHandler(request, h),
    options: {
      auth: "music_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{id}/likes",
    handler: (request, h) => handler.getUserAlbumLikeHandler(request, h),
  },
];

module.exports = routes;
