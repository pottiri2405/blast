'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_URL_STAGE: '"http://localhost:9000/.netlify/functions/stage"' // add by POTTIRI
})
