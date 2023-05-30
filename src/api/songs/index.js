const SongHandler = require("./handler");
const routes = require("./route");
const SongsValidator = require("./validator");

module.exports = {
  name: "songs",
  version: "1.0.0",
  register: async (server, { service }) => {
    const songHandler = new SongHandler(service, SongsValidator);
    server.route(routes(songHandler));
  },
};
