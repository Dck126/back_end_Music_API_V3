class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage("export:songs", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
