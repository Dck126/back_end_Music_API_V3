const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const NotFoundError = require("../exceptions/NotFoundError");
const InvariantError = require("../exceptions/InvariantError");
const { mapSongs, filterPerformerSong, filterTitleSong } = require("../utils");

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    try {
      const id = `song-${nanoid(16)}`;
      const createdAt = new Date().toISOString();

      const query = {
        text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
      };
      const values = [
        id,
        title,
        year,
        performer,
        genre,
        duration,
        albumId,
        createdAt,
        createdAt,
      ];

      const { rows } = await this._pool.query(query, values);
      return rows[0].id;
    } catch {
      throw new InvariantError("songs gagal ditambahkan");
    }
  }

  async getSongs(params) {
    try {
      const query = {
        text: "SELECT id, title, performer FROM songs",
      };
      const resultSongs = await this._pool.query(query);
      let songs = resultSongs.rows;
      if ("title" in params) {
        songs = songs.filter((s) => filterTitleSong(s, params.title));
      }
      if ("performer" in params) {
        songs = songs.filter((s) => filterPerformerSong(s, params.performer));
      }
      return songs;
    } catch {
      console.log("Error Service getSongs");
    }
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
    };
    const values = [id];
    const result = await this._pool.query(query, values);
    const resultId = result.rows.map(mapSongs)[0];
    if (!resultId) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
    return resultId;
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE songs SET title = $1, year = $2, performer = $3, 
      genre = $4, duration = $5, album_id = $6, updated_at = $7 
      WHERE id = $8 RETURNING id`,
    };
    const values = [
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
      updatedAt,
      id,
    ];
    const result = await this._pool.query(query, values);
    const resultId = result.rows.length;
    if (!resultId) {
      throw new NotFoundError("Gagal memperbarui lagu.Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
    };
    const values = [id];
    const result = await this._pool.query(query, values);
    const resultId = result.rows.length;
    if (!resultId) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongService;
