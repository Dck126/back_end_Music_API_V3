class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id, name, year, createdAt, updatedAt } = request.payload;

    const albumId = await this._service.addAlbum({
      id,
      name,
      year,
      createdAt,
      updatedAt,
    });

    const response = h.response({
      status: "success",
      data: {
        albumId: albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response = h.response({
      status: "success",
      message: "Get album berhasil",
      data: album,
    });
    response.code(200);
    return response;
  }

  async editAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    const response = h.response({
      status: "success",
      message: "Album berhasil diperbarui",
    });
    return response;
  }

  async deleteAlbumHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    const response = h.response({
      status: "success",
      message: "Album berhasil dihapus",
    });
    return response;
  }
}

module.exports = AlbumHandler;
