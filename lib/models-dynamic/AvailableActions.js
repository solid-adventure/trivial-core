const AVAILABLE_ACTIONS = Object.freeze({
  ActionWithTransform: require('../actionsv2/actions/ActionWithTransform/Descriptor'),
  Airtable: {
    CreateRecords: require('../actionsv2/actions/Airtable/CreateRecords/Descriptor'),
    ListRecords: require('../actionsv2/actions/Airtable/ListRecords/Descriptor'),
    UpdateRecords: require('../actionsv2/actions/Airtable/UpdateRecords/Descriptor'),
  },
  Collect: require('../actionsv2/actions/Collect/Descriptor'),
  Custom: require('../actionsv2/actions/Custom/Descriptor'),
  Each: require('../actionsv2/actions/Each/Descriptor'),
  EventRule: require('../actionsv2/actions/EventRule/Descriptor'),
  Group: require('../actionsv2/actions/Group/Descriptor'),
  HttpRequest: require('../actionsv2/actions/HttpRequest/Descriptor'),
  If: require('../actionsv2/actions/If/Descriptor'),
  Magic: {
    Query: require('../actionsv2/actions/Magic/Query/Descriptor'),
  },
  Mailgun: {
    SendEmail: require('../actionsv2/actions/Mailgun/SendEmail/Descriptor'),
  },
  MySQL: {
    Query: require('../actionsv2/actions/MySQL/Query/Descriptor'),
  },
  Panel: {
    CrateLabel: require('../actionsv2/actions/Panel/CrateLabel/Descriptor'),
    Headline: require('../actionsv2/actions/Panel/Headline/Descriptor'),
    Spreadsheet: require('../actionsv2/actions/Panel/Spreadsheet/Descriptor'),
    TableView: require('../actionsv2/actions/Panel/TableView/Descriptor'),
  },
  PostgreSQL: {
    Query: require('../actionsv2/actions/PostgreSQL/Query/Descriptor'),
    Upsert: require('../actionsv2/actions/PostgreSQL/Upsert/Descriptor'),
  },
  ReceiveEvent: require('../actionsv2/actions/ReceiveEvent/Descriptor'),
  ReceiveWebhook: require('../actionsv2/actions/ReceiveWebhook/Descriptor'),
  SendEmail: require('../actionsv2/actions/SendEmail/Descriptor'),
  SendResponse: require('../actionsv2/actions/SendResponse/Descriptor'),
  SendSMS: require('../actionsv2/actions/SendSMS/Descriptor'),
  ShipCo: {
    CreateRate: require('../actionsv2/actions/ShipCo/CreateRate/Descriptor'),
    CreateShipment: require('../actionsv2/actions/ShipCo/CreateShipment/Descriptor'),
    ListShipments: require('../actionsv2/actions/ShipCo/ListShipments/Descriptor'),
  },
  Slack: {
    PostMessage: require('../actionsv2/actions/Slack/PostMessage/Descriptor'),
  },
  Square: {
    Generic: require('../actionsv2/actions/Square/Generic/Descriptor'),
    GetCatalog: require('../actionsv2/actions/Square/GetCatalog/Descriptor'),
    GetOrders: require('../actionsv2/actions/Square/GetOrders/Descriptor'),
  },
  Squarespace: {
    GetOrders: require('../actionsv2/actions/Squarespace/GetOrders/Descriptor'),
  },
  Stop: require('../actionsv2/actions/Stop/Descriptor'),
  Transform: require('../actionsv2/actions/Transform/Descriptor'),
  Trivial: {
    AppRunner: require('../actionsv2/actions/Trivial/AppRunner/Descriptor'),
    DatastoreUpsert: require('../actionsv2/actions/Trivial/DatastoreUpsert/Descriptor'),
    DatastoreVerifyModel: require('../actionsv2/actions/Trivial/DatastoreVerifyModel/Descriptor'),
  },
  Twilio: {
    SendSMS: require('../actionsv2/actions/Twilio/SendSMS/Descriptor'),
  },
})

module.exports = AVAILABLE_ACTIONS
