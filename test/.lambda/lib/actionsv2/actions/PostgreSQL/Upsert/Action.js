const ActionBase = require('../../../base/ActionBase')
const PostgreSQLConnection = require('../Connection')

class Upsert extends ActionBase {
  async perform() {

    let credentials = {
      user: this.config.PostgreSQL.user,
      host: this.config.PostgreSQL.host,
      database: this.config.PostgreSQL.database,
      password: this.config.PostgreSQL.password,
      port: this.config.PostgreSQL.port,
      // TODO: set rejectUnauthorized to true
      ssl: {
        rejectUnauthorized: false
      }
    }

    if (!this.canProceed.response) {
      this.setOutputValue({message: this.canProceed.message, status: 200})
      return true
    } else {
      let results
      const pool = PostgreSQLConnection.pool(credentials)
      await pool.query(this.queryString)
      .then(res => results = {results: res.rows, status: 200})
      .catch(e =>  results = PostgreSQLConnection.outputValueForError(e) )

      this.setOutputValue(results)
      return true
    }

  }

  get canProceed() {
    let out = {response: true}
    if (!this.inputValue.rows || this.inputValue.rows.length <= 0) {
      out.response = false
      out.message = "No rows provided, upsert skipped."
      return out
    }

    let sampleRow = this.inputValue.rows[0]
    let uniqueKeys = this.inputValue.uniquenessKey.split(',').map(k => k.trim())
    if (Object.keys(sampleRow).filter(k => !uniqueKeys.includes(k)).length == 0) {
      out.response = false
      out.message = "Must provide columns in addition to those in the uniquenessKey, upsert skipped."
      return out
    }
    return out
  }

  get columnNames() {
    let sample = this.inputValue.rows[0]
    return Object.keys(sample)
  }

  get formattedColumnNames() {
    return this.columnNames.map(k => `"${k}"`).join(',\n  ')
  }

  get insertValues() {
    let values = []
    for (let row of this.inputValue.rows) {
      values.push(Object.values(row))
    }
    return this.format(values)
  }

  get excludedString() {
    let out = []
    let blacklist = this.inputValue.uniquenessKey.replace(/ /g, '').split(',')
    let toExclude = this.columnNames.filter(k => !blacklist.includes(k))
    for (let key of toExclude) {
      out.push(`  "${key}" = EXCLUDED."${key}"`)
    }
    return out.join(',\n')
    console.log(toExclude)
  }

  get queryString() {
    // TODO: Run the tablename through the official PG formatter to reduce SQL Injection threat
    let out = `INSERT INTO "${this.inputValue.tableName}" (
  ${this.formattedColumnNames}
  )
VALUES
${this.insertValues}

ON CONFLICT(${this.inputValue.uniquenessKey})
DO UPDATE
SET 
${this.excludedString}
;
`
    if (this.logVerbose) { this.logEvent(`[queryString]`, true, {out: out}) }
    return out
  }

  format(values) {
    let out = []
    for (let v of values) {
      let line = '('
      line += v.map(va => `${this.wrapChar(va)}${this.safe(va)}${this.wrapChar(va)}`)
      line += ')'
      out.push(line)
    }
    return out.join(',')
  }

  // Escape single quotes
  safe(val) {
    if (typeof val != "string") { return val }
    return val.replace(/'/g, "\''")
  }

  wrapChar(val) {
    if (typeof val == "string") { return "'"}
    return ''
  }


}

module.exports = Upsert


// INSERT INTO shopify_products_live (
//   "product_id",
//   "variant_id",
//   "Handle",
//   "Title",
//   "Variant SKU",
//   "Custom Product Type",
//   "Option1 Value",
//   "Option2 Value",
//   "Published"
// ) 
// VALUES (6696282587315,39819823317171,'the-long-and-short-of-it','The Long and Short of It','804297838335','Music','Paint Splatter Vinyl + MP3 Download','_',true),(6696282587315,39819823349939,'the-long-and-short-of-it','The Long and Short of It','804297838342','Music','Forest Green Vinyl + MP3 Download','_',true),(6696282587315,39819823382707,'the-long-and-short-of-it','The Long and Short of It','804297838311','Music','Vinyl + MP3 Download','_',true),(6696282587315,39819823415475,'the-long-and-short-of-it','The Long and Short of It','804297838328','Music','CD + MP3 Download','_',true),(6696282587315,39819823448243,'the-long-and-short-of-it','The Long and Short of It','804297838304W','Music','WAV Download','_',true),(6696282587315,39819823481011,'the-long-and-short-of-it','The Long and Short of It','804297838304','Music','MP3 Download','_',true),(6696282587315,39819823513779,'the-long-and-short-of-it','The Long and Short of It','US2J72108301','Music','MP3','Phases (ft. Sharrif Simmons)',true),(6696282587315,39819823546547,'the-long-and-short-of-it','The Long and Short of It','US2J72108302','Music','MP3','Come Visit Me',true),(6696282587315,39819823579315,'the-long-and-short-of-it','The Long and Short of It','US2J72108303','Music','MP3','Interlude',true),(6696282587315,39819823612083,'the-long-and-short-of-it','The Long and Short of It','US2J72108304','Music','MP3','Shee',true),(6696282587315,39819823644851,'the-long-and-short-of-it','The Long and Short of It','US2J72108305','Music','MP3','Leave It',true),(6696282587315,39819823677619,'the-long-and-short-of-it','The Long and Short of It','US2J72108306','Music','MP3','I Am Close to the River',true),(6696282587315,39819823710387,'the-long-and-short-of-it','The Long and Short of It','US2J72108307','Music','MP3','Feel',true),(6696282587315,39819823743155,'the-long-and-short-of-it','The Long and Short of It','US2J72108308','Music','MP3','A Conversation',true),(6696282587315,39819823775923,'the-long-and-short-of-it','The Long and Short of It','US2J72108309','Music','MP3','Everything is Different (To Me)',true),(6696282587315,39819823808691,'the-long-and-short-of-it','The Long and Short of It','US2J72108310','Music','MP3','Wy',true),(6696282587315,39819881119923,'the-long-and-short-of-it','The Long and Short of It','US2J72108311','Music','MP3','Otto''s Dance',true)
// ON CONFLICT(product_id,variant_id)
// WHERE "product_id" IS NOT NULL
// and "variant_id" IS NOT NULL
// DO UPDATE
// SET 
//   "Handle" = EXCLUDED."Handle",
//   "Title" = EXCLUDED."Title",
//   "Variant SKU" = EXCLUDED."Variant SKU",
//   "Custom Product Type" = EXCLUDED."Custom Product Type",
//   "Option1 Value" = EXCLUDED."Option1 Value",
//   "Option2 Value" = EXCLUDED."Option2 Value",
//   "Published" = EXCLUDED."Published"
