const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3)  RETURNING id",
    };
    const values = [id, userId, albumId];
    const result = await this._pool.query(query, values);

    if (!result.rows[0].id) {
      throw new InvariantError("Cannot add an Album Like");
    }

    await this._cacheService.remove(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async getAlbumLike(albumId) {
    const result = await this._cacheService.get(`likes:${albumId}`);

    if (result) return { likes: parseInt(JSON.parse(result)), isCached: true };

    const query = {
      text: `SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1`,
    };
    const values = [albumId];

    const { rows, rowCount } = await this._pool.query(query, values);

    if (!rowCount) {
      throw new NotFoundError("Album not found");
    }

    await this._cacheService.set(
      `likes:${albumId}`,
      JSON.stringify(rows[0].count)
    );

    return {
      likes: parseInt(rows[0].count, 10),
      isCached: false,
    };
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id`,
    };
    const values = [userId, albumId];
    const { rowCount } = await this._pool.query(query, values);

    if (!rowCount) {
      throw new NotFoundError("Cannot delete album like. Id not found");
    }

    await this._cacheService.remove(`likes:${albumId}`);
  }

  async verifyAlbumLike(userId, albumId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
    };
    const values = [userId, albumId];

    const result = await this._pool.query(query, values);

    return result.rowCount > 0;
  }
}

module.exports = UserAlbumLikesService;
