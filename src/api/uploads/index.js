const UploadsHandler = require("./handler");
const routes = require("./routes");
const UploadsValidator = require("./validator");

module.exports = {
  name: "uploads",
  version: "1.0.0",
  register: async (server, { service, albumsService }) => {
    const uploadsHandler = new UploadsHandler(
      service,
      UploadsValidator,
      albumsService
    );
    server.route(routes(uploadsHandler));
  },
};
