const Joi = require("joi");
const InvariantError = require("../../exceptions/InvariantError");

const ExportSongsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

const ExportsValidator = {
  validateExportPayload: (payload) => {
    const validationResult = ExportSongsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
