/**
 * Module with middleware sending requests to functionality in corresponding module and function
 * @module middleware/routes
 * @requires module:server/config
 * @requires module:server/helpers/database
 * @requires module:server/helpers/common
 */

var express = require('express')
var router = express.Router()
var start = require('./start')
var klurig = require('./klurig')
var orden = require('./orden')

/**
 * start
 */
router.get('/', start.index)
router.get('/klurigheter', klurig.index)
router.get('/ordenrunt', orden.index)

module.exports = router
