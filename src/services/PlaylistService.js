const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthorizationError = require("../exceptions/AuthorizationError");

class PlaylistService {
  constructor(songService, activityService, collaborationService) {
    this._pool = new Pool();
    this._songService = songService;
    this._activityService = activityService;
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id",
    };
    const values = [id, name, owner, createdAt, updatedAt];
    const result = await this._pool.query(query, values);
    const resultId = result.rows[0].id;
    if (!resultId) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }
    return resultId;
  }

  async getPlaylists(id) {
    try {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
              LEFT JOIN collaborations on collaborations.playlist_id = playlists.id
              INNER JOIN users on users.id = playlists.owner
              WHERE playlists.owner = $1 OR playlists.id = $1 OR collaborations.user_id = $1`,
      };
      const values = [id];

      const result = await this._pool.query(query, values);

      return result.rows;
    } catch {
      console.log("Error Service getPlaylists");
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
    };
    const values = [id];

    const result = await this._pool.query(query, values);
    const resultId = result.rows.length;
    if (!resultId) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async addPlaylistSong(playlistId, songId, userId) {
    const querySong = {
      text: "SELECT id FROM songs WHERE id = $1",
    };
    const valuesSong = [songId];

    const resultSongs = await this._pool.query(querySong, valuesSong);
    if (!resultSongs.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
    const id = `playlist-song${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $5) RETURNING id",
    };
    const values = [id, playlistId, songId, createdAt, createdAt];

    const result = await this._pool.query(query, values);
    const resultId = result.rows[0].id;

    if (!resultId) {
      throw new InvariantError("Lagu tidak dapat ditambahkan ke playlist");
    }
    await this._activityService.addActivity(playlistId, userId, songId);
    return resultSongs.rows.length;
  }

  async getPlaylistSong(playlistId) {
    try {
      const queryPlaylist = {
        text: `SELECT playlists.id, playlists.name, users.username FROM playlists
              LEFT JOIN users on playlists.owner = users.id
              WHERE playlists.id = $1`,
      };
      const valuesPlaylist = [playlistId];
      const querySong = {
        text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
              JOIN songs on playlist_songs.song_id = songs.id
              WHERE playlist_id = $1`,
      };
      const valuesSong = [playlistId];

      const resultPlaylist = await this._pool.query(
        queryPlaylist,
        valuesPlaylist
      );
      const resultSongs = await this._pool.query(querySong, valuesSong);
      const PlaylistSong = (playlistData, songData) => ({
        playlist: {
          id: playlistData.id,
          name: playlistData.name,
          username: playlistData.username,
          songs: songData,
        },
      });
      return PlaylistSong(resultPlaylist.rows[0], resultSongs.rows);
    } catch {
      console.log("Error Serivce getPlaylistSong");
    }
  }

  async deletePlaylistSong(songId, playlistId, userId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE song_id = $1 RETURNING song_id",
    };
    const values = [songId];

    const result = await this._pool.query(query, values);

    if (!result.rows.length) {
      throw new NotFoundError("Song gagal dihapus. Id tidak ditemukan");
    }

    await this._activityService.deleteActivity(playlistId, userId, songId);
  }

  async getActivity(playlistId) {
    try {
      const playlist = await this.getPlaylists(playlistId);
      const query = {
        text: `SELECT users.username, 
              songs.title, 
              playlist_song_activities.action, 
              playlist_song_activities.time  
              FROM playlist_song_activities 
              INNER JOIN users ON users.id = playlist_song_activities.user_id
              INNER JOIN songs on songs.id = playlist_song_activities.song_id
              WHERE playlist_song_activities.playlist_id = $1
              ORDER BY time asc`,
      };
      const values = [playlistId];

      const result = await this._pool.query(query, values);

      const Activity = (playlistId, activities) => ({
        playlistId: playlistId,
        activities: activities,
      });

      return Activity(playlist[0].id, result.rows);
    } catch {
      console.log("Error Service getActivity");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaboration(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT id, owner FROM playlists WHERE id = $1",
    };
    const values = [id];

    const result = await this._pool.query(query, values);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = PlaylistService;
