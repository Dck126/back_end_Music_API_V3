const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const NotFoundError = require("../exceptions/NotFoundError");
const InvariantError = require("../exceptions/InvariantError");

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    try {
      const id = `album-${nanoid(16)}`;
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;
      const query = {
        text: "INSERT INTO albums VALUES ($1, $2, $3, $4, $5) RETURNING id",
      };
      const values = [id, name, year, createdAt, updatedAt];
      const result = await this._pool.query(query, values);
      return result.rows[0].id;
    } catch {
      throw new InvariantError("data album tidak dapat ditambahkan");
    }
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: `SELECT id, name, year, cover as "coverUrl" FROM albums WHERE id = $1`,
    };
    const valuesAlbum = [id];
    const { rows, rowCount } = await this._pool.query(queryAlbum, valuesAlbum);

    if (!rowCount) {
      throw new NotFoundError("Album not found");
    }

    const querySong = {
      text: `SELECT s.id, s.title, s.performer FROM albums JOIN songs s ON albums.id = s.album_id WHERE albums.id = $1`,
    };
    const valuesSong = [id];
    const { rows: songs } = await this._pool.query(querySong, valuesSong);

    return {
      album: {
        ...rows[0],
        songs,
      },
    };
  }

  async editAlbumById(id, { name, year }) {
    try {
      const updatedAt = new Date().toISOString();
      const query = {
        text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
      };
      const values = [name, year, updatedAt, id];
      const result = await this._pool.query(query, values);
      !result.rows[0].id;
    } catch {
      throw new NotFoundError("Gagal memperbaharui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    try {
      const query = {
        text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      };
      const values = [id];
      const result = await this._pool.query(query, values);
      !result.rows[0].id;
    } catch {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }

  async updateAlbumCover(id, coverUrl) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id",
    };
    const values = [coverUrl, id];

    const result = await this._pool.query(query, values);

    if (!result.rowCount) {
      throw new NotFoundError(
        "Album gagal diperbaharui, album id tidak ditemukan"
      );
    }
  }
}

module.exports = AlbumService;
