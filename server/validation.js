const Joi = require("joi");

const validator = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(28).required(),
    password: Joi.string().min(6).max(1024).required(),
  });
  return schema.validate(data);
};

module.exports = validator;
