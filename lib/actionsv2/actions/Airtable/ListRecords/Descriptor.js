const AirtableActionDescriptor = require('../DescriptorBase')

class ListRecordsDescriptor extends AirtableActionDescriptor {

  get fullDescriptionHTML() {

    let h = `
    This action fetches rows from an Airtable base in JSON format.
    <h2>Overview</h2>
    Airtable is a great place to store data when a full database is more than you need.
    You might use Airtable/List Records as part of a sequence that:
    <ul>
      <li>Sends a reminder to customers that are renewing soon 💰</li>
      <li>Checks today's orders to make sure they've all shipped 😎</li>
      <li>Creates a support ticket for subscribers with failed payments 🔥</li>
    </ul>
    <h2>You will need</h2>
    <ul>
    <li>An Airtable account</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li>Copy and paste your private API key from your <a href="https://airtable.com/account" target="_blank">Airtable Account page</a> into <strong>API Key</strong></li>
      <li>Copy and paste the Base ID, found by <a href="https://airtable.com/api"  target="_blank">selecting your Base from the API docs</a></li>
      <li>Enter the table's name. In Airtable, this is the name of the tab, and defaults to <strong>Table 1</strong></li>
      <li>Save and test your app</li>
    </ol>
    `
    return h
  }

  get expectedTypeName() {
    return 'AirtableListRecords'
  }

}

module.exports = ListRecordsDescriptor
