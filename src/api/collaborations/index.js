const CollaborationHandler = require("./handler");
const routes = require("./route");
const CollaborationValidator = require("./validator");

module.exports = {
  name: "collaborations",
  version: "1.0.0",
  register: async (server, { collaborationService, playlistsService }) => {
    const collaborationHandler = new CollaborationHandler(
      collaborationService,
      playlistsService,
      CollaborationValidator
    );
    server.route(routes(collaborationHandler));
  },
};
