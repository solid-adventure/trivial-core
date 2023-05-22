const {
    schema,
    RequiredString
} = require('../../../schema-utils')

module.exports.TwilioOutboundMessage = schema({fields: {
    Body: RequiredString,
    To: RequiredString,
    From: RequiredString
}})