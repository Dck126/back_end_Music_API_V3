const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

class AuthenticationService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    try {
      const query = {
        text: "INSERT INTO authentications VALUES($1)",
      };
      const values = [token];

      await this._pool.query(query, values);
    } catch {
      console.log("Error Service addRefreshToken");
    }
  }

  async verifyRefreshToken(token) {
    const query = {
      text: "SELECT token FROM authentications WHERE token = $1",
    };
    const values = [token];

    const result = await this._pool.query(query, values);
    const resultToken = result.rows.length;
    if (!resultToken) {
      throw new InvariantError("Refresh token tidak valid");
    }

    return resultToken;
  }

  async deleteRefreshToken(token) {
    try {
      const query = {
        text: "DELETE FROM authentications WHERE token = $1",
      };
      const values = [token];

      await this._pool.query(query, values);
    } catch {
      console.log("Error Service deleteRefreshToken");
    }
  }
}

module.exports = AuthenticationService;
