const ActionBase = require('../../../base/ActionBase')

class GetOrders extends ActionBase {
  async perform() {

    this.beforePerform()
    const res = await this.fetch( this.url,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${this.config.Squarespace.api_key}`
        }
      }
    )

    // Stop if any result is not ok
    if (res.status != 200) {
      let body = await res.json()
      this.logEvent('[Squarespace Get Orders]', false, { body })
      this.setHTTPResponseOutput(res, body)
      return true
    }

    // Fetch the results and run again if there are additional pages
    let body = await res.json()
    if (this.logVerbose) { this.logEvent('[Squarespace Get Orders VERBOSE]', true, { body }) }
    await this.handlePagination(body)

    // Return the combined results when there are no more pages or we've hit the maxRows limit
    if (this.completed) {
      this.setHTTPResponseOutput(res, this.customResponseBody)
      return true
    }
  }

  beforePerform() {
    this.orders = (typeof this.orders == 'undefined') ? [] : this.orders
    this.setMaxRows()
  }

  get customResponseBody() {
    return {
      count: this.orderCount,
      orders: this.orders
    }
  }

  get orderCount() {
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
    this.orders = this.orders.concat(body.result)
    this.logEvent('Paginator With New Results', true, {orderCount: this.orderCount, maxRows: this.maxRows})

    if (body && body.pagination && body.pagination.hasNextPage) {
      this.cursor = body.pagination.nextPageCursor
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

  get searchParams() {

    // Caution: A request cannot use both a cursor and a date range; only a cursor OR a date range may be used.
    if (this.cursor) {
      return {
        cursor: this.cursor
      }
    }

    return {
      modifiedAfter: this.inputValue.modifiedAfter,
      modifiedBefore: this.inputValue.modifiedBefore,
      fulfillmentStatus: this.inputValue.fulfillmentStatus
    }
  }

  get url() {
    let url = new URL(`https://api.squarespace.com/1.0/commerce/orders`)
    for (let k of Object.keys(this.searchParams)) {
      if ( typeof(this.searchParams[k]) != 'undefined' ) { url.searchParams.set(k, this.searchParams[k]) }
    }
    return url
  }

}

module.exports = GetOrders
