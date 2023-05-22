module.exports = {
  "swagger": "2.0",
  "info": {
    "title": "Trivial",
    "description": "Trivial stub created by Trivial",
    "version": "0.1"
  },
  "url": process.env.TRIVIAL_URL || "https://trivial-api-staging.herokuapp.com",
  "headers": [
    "access-token",
    "client",
    "expiry",
    "uid"
  ],
  resetHeader: "reset",
  resetCalls: [
    ["put", "/auth/password"]
  ]
}