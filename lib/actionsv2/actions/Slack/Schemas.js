const { schema } = require('../../../schema-utils');

module.exports.SlackMessage = schema({
  fields: {
    text: {
      type: String,
      required: true,
      example: "`Hello from Trivial!`",
    },
  },
});
