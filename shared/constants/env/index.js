const env = process.env.APP_ENV || 'development'

module.exports = require(`./${env}`)
