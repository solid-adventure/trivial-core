// Note the local inheritance
const ActionBase = require('../ActionBase')

class GetOrders extends ActionBase {

  async perform() {
    this.beforePerform()
    const res = await this.fetchWithAuth(
      `https://connect.squareup.com/v2/orders/search`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Square-Version': '2022-08-23'
        },
        body: JSON.stringify(this.body)
      }
    )

    // Stop if any result is not ok
    if (res.status != 200) {
      this.setHTTPResponseOutput(res, await res.json())
      return true
    }

    // Fetch the results and run again if there are additional pages
    let body = await res.json()
    await this.handlePagination(body)

    // Return the combined results when there are no more pages or we've hit the maxRows limit
    if (this.completed) {
      this.setHTTPResponseOutput(res, this.customResponseBody)
      return true
    }

    return true
  }

  beforePerform() {
    this.orders = (typeof this.orders == 'undefined') ? [] : this.orders
    this.setMaxRows()
  }

  get body() {
    let out = {
      location_ids: this.inputValue.location_ids,
    }

    if (this.inputValue.query) {
      out.query = this.inputValue.query
    }

    if (this.cursor) {
      out.cursor = this.cursor
    }

    return out
  }

  get customResponseBody() {
    return {
      count: this.orderCount,
      orders: this.orders
    }
  }

  get orderCount() {
    // Filter empty results
    return this.orders.filter(o => o).length
  }

  setMaxRows() {
    // If we have a user configuration, store it on the object for future cycles
    if (this.inputValue.maxRows) {
      this.maxRows = this.inputValue.maxRows
      delete this.inputValue.maxRows
    // If we don't have a user configuration and we're not defined, use the default
    } else if (!this.maxRows) {
      this.maxRows = 300
    }
  }

  async handlePagination(body) {
    this.orders = this.orders.concat(body.orders)
    this.logEvent('Paginator With New Results', true, {orderCount: this.orderCount, maxRows: this.maxRows})

    if (body && body.cursor) {
      this.cursor = body.cursor
    } else {
      this.completed = true
    }

    if (this.orderCount >= this.maxRows) {
      this.completed = true
    }

    if (!this.completed) {
      await this.perform()
    }
    return true
  }

}

module.exports = GetOrders
