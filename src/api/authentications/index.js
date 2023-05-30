const AuthenticationHandler = require("./handler");
const routes = require("./route");
const AuthenticationsValidator = require("./validator");

module.exports = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    { authenticationsService, usersService, tokenManager }
  ) => {
    const authenticationHandler = new AuthenticationHandler(
      authenticationsService,
      usersService,
      tokenManager,
      AuthenticationsValidator
    );
    server.route(routes(authenticationHandler));
  },
};
