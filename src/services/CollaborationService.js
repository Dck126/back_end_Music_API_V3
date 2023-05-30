const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

class CollaborationService {
  constructor(userService) {
    this._pool = new Pool();
    this._userService = userService;
  }

  async verifyCollaboration(playlistId, userId) {
    const query = {
      text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
    };
    const values = [playlistId, userId];

    const result = await this._pool.query(query, values);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal diverifikasi");
    }
  }

  async addCollaboration(playlistId, userId) {
    await this._userService.verifyUserInDatabase(userId);
    const id = `collab-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: "INSERT INTO collaborations VALUES($1, $2, $3, $4, $5) RETURNING id",
    };
    const values = [id, playlistId, userId, createdAt, updatedAt];

    const result = await this._pool.query(query, values);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
    };
    const values = [playlistId, userId];

    const result = await this._pool.query(query, values);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal dihapus");
    }
  }
}

module.exports = CollaborationService;
