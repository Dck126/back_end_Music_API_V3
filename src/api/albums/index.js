const AlbumHandler = require("./handler");
const routes = require("./route");
const AlbumsValidator = require("./validator");

module.exports = {
  name: "albums",
  version: "1.0.0",
  register: async (server, { service }) => {
    const albumHandler = new AlbumHandler(service, AlbumsValidator);
    server.route(routes(albumHandler));
  },
};
