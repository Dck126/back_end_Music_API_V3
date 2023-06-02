const ExportsHandler = require("./handler");
const routes = require("./routes");
const ExportsValidator = require("./validator");

module.exports = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { service, playlistsService }) => {
    const exportsHandler = new ExportsHandler(
      service,
      ExportsValidator,
      playlistsService
    );
    server.route(routes(exportsHandler));
  },
};
