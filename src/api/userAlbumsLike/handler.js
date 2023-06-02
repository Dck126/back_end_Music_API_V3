class UserAlbumLikesHandler {
  constructor(userAlbumLikesService, albumsService) {
    this._userAlbumLikeService = userAlbumLikesService;
    this._albumsService = albumsService;
  }

  async postUserAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);

    const isLiked = await this._userAlbumLikeService.verifyAlbumLike(
      userId,
      albumId
    );

    let result = {};
    let statusCode = 201;
    if (isLiked) {
      result = {
        status: "fail",
        message: "Album already liked",
      };

      statusCode = 400;
    } else {
      await this._userAlbumLikeService.addAlbumLike(userId, albumId);
      result = {
        status: "success",
        message: `Like added to album ${albumId}`,
      };
    }
    const response = h.response(result);
    response.code(statusCode);
    return response;
  }

  async getUserAlbumLikeHandler(request, h) {
    const { id } = request.params;
    // await this._albumsService.getAlbumById(id);
    const { likes, cache } = await this._userAlbumLikeService.getAlbumLike(id);

    const response = h.response({
      status: "success",
      data: {
        likes: likes,
      },
    });

    response.code(200);

    if (cache) {
      response.header("X-Data-Source", "cache");
    }

    return response;
  }

  async deleteUserAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(id);

    const isLiked = await this._userAlbumLikeService.verifyAlbumLike(
      userId,
      id
    );

    if (!isLiked) {
      const response = h.response({
        status: "fail",
        message: "Like not found",
      });
      response.code(404);
      return response;
    }
    await this._userAlbumLikeService.deleteAlbumLike(userId, id);

    const response = h.response({
      status: "success",
      message: "Like deleted",
    });
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
