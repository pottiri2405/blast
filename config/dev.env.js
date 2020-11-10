'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  MAIN_URL_JA: '"http://localhost:1313"', // add by POTTIRI
  MAIN_URL_EN: '"http://localhost:1313"' // add by POTTIRI
})
