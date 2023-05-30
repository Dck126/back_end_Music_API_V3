class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: "success",
      data: {
        playlistId: playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getplaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(credentialId);

    const response = h.response({
      status: "success",
      data: {
        playlists,
      },
    });
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);

    await this._service.deletePlaylistById(id);

    const response = h.response({
      status: "success",
      message: "Playlist berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    const playlistId = request.params;

    await this._service.verifyPlaylistAccess(playlistId.id, credentialId);

    await this._service.addPlaylistSong(playlistId.id, songId, credentialId);

    const response = h.response({
      status: "success",
      message: "Song berhasil ditambahkan ke playlist",
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlistId = request.params;

    await this._service.verifyPlaylistAccess(playlistId.id, credentialId);

    const playlist = await this._service.getPlaylistSong(playlistId.id);

    const response = h.response({
      status: "success",
      data: playlist,
    });
    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const playlistId = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(playlistId.id, credentialId);

    await this._service.deletePlaylistSong(songId, playlistId.id, credentialId);

    const response = h.response({
      status: "success",
      message: "Song berhasil dihapus dari playlist",
    });
    response.code(200);
    return response;
  }

  async getPlaylistActivityHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlistId = request.params;

    await this._service.verifyPlaylistAccess(playlistId.id, credentialId);

    const activities = await this._service.getActivity(playlistId.id);
    const response = h.response({
      status: "success",
      data: activities,
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistHandler;
