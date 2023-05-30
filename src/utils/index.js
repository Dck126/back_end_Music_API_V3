/* eslint-disable key-spacing */
/* eslint-disable camelcase */
const mapSongs = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});
const filterTitleSong = (song, title) =>
  song.title.toLowerCase().includes(title);
const filterPerformerSong = (song, performer) =>
  song.performer.toLowerCase().includes(performer);

module.exports = {
  mapSongs,
  filterTitleSong,
  filterPerformerSong,
};
