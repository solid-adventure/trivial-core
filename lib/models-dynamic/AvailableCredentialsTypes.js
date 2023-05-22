const AVAILABLE_TYPES = Object.freeze({
  AirtableCredentials: require('../actionsv2/actions/Airtable/CredentialType'),
  ArkaCredentials: require('../actionsv2/actions/Arka/CredentialType'),
  DiscordCredentials: require('../actionsv2/actions/Discord/CredentialType'),
  MagicCredentials: require('../actionsv2/actions/Magic/CredentialType'),
  MailgunCredentials: require('../actionsv2/actions/Mailgun/CredentialType'),
  MySQLCredentials: require('../actionsv2/actions/MySQL/CredentialType'),
  PostgreSQLCredentials: require('../actionsv2/actions/PostgreSQL/CredentialType'),
  ShipCoCredentials: require('../actionsv2/actions/ShipCo/CredentialType'),
  ShopifyCredentials: require('../actionsv2/actions/Shopify/CredentialType'),
  SlackCredentials: require('../actionsv2/actions/Slack/CredentialType'),
  SquareCredentials: require('../actionsv2/actions/Square/CredentialType'),
  SquarespaceCredentials: require('../actionsv2/actions/Squarespace/CredentialType'),
  TrivialCredentials: require('../actionsv2/actions/Trivial/CredentialType'),
  TwilioCredentials: require('../actionsv2/actions/Twilio/CredentialType'),
  WhiplashCredentials: require('../actionsv2/actions/Whiplash/CredentialType'),
})

module.exports.AVAILABLE_TYPES = AVAILABLE_TYPES
