// Note the local inheritance
const ActionBase = require('../ActionBase')

class GetCatalog extends ActionBase {

  async perform() {
    this.beforePerform()
    const res = await this.fetchWithAuth(
      this.url,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'Square-Version': '2022-08-23'
        }
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
    this.catalogItems = (typeof this.catalogItems == 'undefined') ? [] : this.catalogItems
    this.setMaxRows()
  }

  get url() {
    let base = `https://connect.squareup.com/v2/catalog/list`
    let out = new URL(base)
    if (this.inputValue.types) {
      out.searchParams.set('types', this.inputValue.types)
    }
    if (this.cursor) {
      out.searchParams.set('cursor', this.cursor)
    }
    return out
  }

  get customResponseBody() {
    return {
      count: this.catalogItemCount,
      items: this.catalogItems
    }
  }

  get catalogItemCount() {
    // Filter empty results
    return this.catalogItems.filter(o => o).length
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
    this.catalogItems = this.catalogItems.concat(body.objects)
    this.logEvent('Paginator With New Results', true, {catalogItemCount: this.catalogItemCount, maxRows: this.maxRows})

    if (body && body.cursor) {
      this.cursor = body.cursor
    } else {
      this.completed = true
    }

    if (this.catalogItemCount >= this.maxRows) {
      this.completed = true
    }

    if (!this.completed) {
      await this.perform()
    }
    return true
  }

}

module.exports = GetCatalog
