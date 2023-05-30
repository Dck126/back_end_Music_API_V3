const { nanoid } = require("nanoid");
const { Pool } = require("pg");

class ActivityService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, userId, songId, action) {
    try {
      const id = `activity-${nanoid(16)}`;
      const time = new Date();
      const action = "add";
      const query = {
        text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)",
      };
      const values = [id, playlistId, songId, userId, action, time];

      await this._pool.query(query, values);
    } catch {
      console.log("Error Service addActivity");
    }
  }

  async deleteActivity(playlistId, userId, songId) {
    try {
      const id = `activity-${nanoid(16)}`;
      const time = new Date();
      const action = "delete";
      const query = {
        text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)",
      };
      const values = [id, playlistId, songId, userId, action, time];

      await this._pool.query(query, values);
    } catch {
      console.log("Error Service deleteActivity");
    }
  }
}

module.exports = ActivityService;
