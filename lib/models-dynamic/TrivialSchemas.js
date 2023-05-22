const Airtable = require('../actionsv2/actions/Airtable/Schemas')
const Arka = require('../actionsv2/actions/Arka/Schemas')
const Discord = require('../actionsv2/actions/Discord/Schemas')
const Magic = require('../actionsv2/actions/Magic/Schemas')
const Mailgun = require('../actionsv2/actions/Mailgun/Schemas')
const MySQL = require('../actionsv2/actions/MySQL/Schemas')
const Panel = require('../actionsv2/actions/Panel/Schemas')
const PostgreSQL = require('../actionsv2/actions/PostgreSQL/Schemas')
const ShipCo = require('../actionsv2/actions/ShipCo/Schemas')
const Shopify = require('../actionsv2/actions/Shopify/Schemas')
const Slack = require('../actionsv2/actions/Slack/Schemas')
const Square = require('../actionsv2/actions/Square/Schemas')
const Squarespace = require('../actionsv2/actions/Squarespace/Schemas')
const Trivial = require('../actionsv2/actions/Trivial/Schemas')
const Twilio = require('../actionsv2/actions/Twilio/Schemas')
const Whiplash = require('../actionsv2/actions/Whiplash/Schemas')

const TrivialSchemas = {
  ...Airtable,
  ...Arka,
  ...Discord,
  ...Magic,
  ...Mailgun,
  ...MySQL,
  ...Panel,
  ...PostgreSQL,
  ...ShipCo,
  ...Shopify,
  ...Slack,
  ...Square,
  ...Squarespace,
  ...Trivial,
  ...Twilio,
  ...Whiplash,
}

module.exports = TrivialSchemas
