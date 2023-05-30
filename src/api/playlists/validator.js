const Joi = require("joi");
const InvariantError = require("../../exceptions/InvariantError");

const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const playlistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = playlistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    return validationResult.value;
  },

  validatePlaylistSongPayload: (payload) => {
    const validationResult = playlistSongPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }

    return validationResult.value;
  },
};

module.exports = PlaylistsValidator;
