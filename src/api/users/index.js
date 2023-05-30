const UserHandler = require("./handler");
const routes = require("./route");
const UsersValidator = require("./validator");

module.exports = {
  name: "users",
  version: "1.0.0",
  register: async (server, { service }) => {
    const userHandler = new UserHandler(service, UsersValidator);
    server.route(routes(userHandler));
  },
};
