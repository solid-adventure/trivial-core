const {
    schema,
    OptionalString,
    RequiredString
} = require('../../../schema-utils')

module.exports.MailgunOutboundEmail = schema({fields: {
    from: {type: String, required: true, example: "`youremail@yourdomain.com`"},
    to: {type: String, required: true, example: "`recipient@otherdomain.com`"},
    subject: {type: String, required: true, example: "`Subject line`"},
    text: {type: String, required: true, example: "`Plain text email content`"},
    cc: OptionalString,
    bcc: OptionalString,
    html: OptionalString,
    attachment_url: {type: String, required: false, example: "`https://trivial-public.s3.us-east-2.amazonaws.com/Trivial+Vision.pdf`"}

}})