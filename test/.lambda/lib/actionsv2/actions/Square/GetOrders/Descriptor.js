  const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class GetOrdersDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Fetch orders from Square using the Search Orders endpoint.</p>

    <p>To find your location ID, in the Square Dashboard, go to Account Settings -> Locations. Choose a location to see it's Location Details page. The location_id will be visible in the URL. </p>

    <p>For more information on creating query filters, see the <a href="https://developer.squareup.com/docs/orders-api/manage-orders/search-orders" target="_blank">Square API Documentation</a>.</p>

    <h3>Setup</h3>
    <ol>
      <li>Create a production application in the <a href="https://developer.squareup.com/apps" target="_blank">Square Developer Dashboard</a></li>
      <li>Set your new Square app's redirect URL to <code>${this.oauth2RedirectUrl}</code></li>
      <li>Use the Configure button below to add the new app's <strong>Production</strong> details and hit Authorize.</li>
      <li>You'll be prompted to enter your Square password and automatically returned to this page.</li>
      <li>Hit "Save"</li>
      <li>Save your app to use the new credentials.</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/square.png'
  }

  getCredentialTypes(){
    return {
      Square: {type: 'SquareCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'SquareGetOrders'
  }

}

module.exports = GetOrdersDescriptor
