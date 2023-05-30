const PlaylistHandler = require("./handler");
const routes = require("./route");
const PlaylistsValidator = require("./validator");

module.exports = {
  name: "playlists",
  version: "1.0.0",
  register: async (server, { service }) => {
    const playlistHandler = new PlaylistHandler(service, PlaylistsValidator);
    server.route(routes(playlistHandler));
  },
};
