const AirtableActionDescriptor = require('../DescriptorBase')

class UpdateRecordsDescriptor extends AirtableActionDescriptor {

  get fullDescriptionHTML() {

    let h = `
    This action updates records for an Airtable table.
    <h2>Overview</h2>
    To use this action, you'll need an exisiting table from Airtable.
    </br>Then you'll be able to send updates to your existing table.  
    <h2>You will need</h2>
    <ul>
    <li> <a href="https://airtable.com/account" target="_blank">An Airtable account</a> </li>
    </ul>
    `
    return h
  }

  get expectedTypeName() {
    return 'AirtableRecords'
  }

}

module.exports = UpdateRecordsDescriptor