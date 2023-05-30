class CollaborationHandler {
  constructor(collaborationService, playlistsService, validator) {
    this._collaborationService = collaborationService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }
  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationService.addCollaboration(
      playlistId,
      userId
    );

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: {
        collaborationId: collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._collaborationService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationHandler;
