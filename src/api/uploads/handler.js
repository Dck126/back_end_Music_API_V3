class UploadsHandler {
  constructor(service, validator, albumsService) {
    this._service = service;
    this._validator = validator;
    this._albumsService = albumsService;
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/covers/${filename}`;

    await this._albumsService.updateAlbumCover(id, coverUrl);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
      data: {
        coverUrl: coverUrl,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
