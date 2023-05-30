const Joi = require("joi");
const currentYear = new Date().getFullYear();

const albumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
});

const InvariantError = require("../../exceptions/InvariantError");

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = albumPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
    return validationResult.value;
  },
};

module.exports = AlbumsValidator;
