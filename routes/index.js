/**
 * Module with middleware sending requests to functionality in corresponding module and function
 * @module middleware/routes
 * @requires module:server/config
 * @requires module:server/helpers/database
 * @requires module:server/helpers/common
 */

var express = require('express')
var router = express.Router()

/**
 * start
 */
var file = require('./start')
router.get('/', file.index)

module.exports = router
