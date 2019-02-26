/* global __dirname */
/**
 * Start module for the application
 */

var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var busboy = require('connect-busboy')
var swig = require('swig')
var config = require('./config.js')
var path = require('path')
var routes = require('./routes/index.js')

var app = express()

var server = app.listen(config.serverport, function () {
  console.log('Listening on port %d', server.address().port)
})

global.appRoot = path.resolve(__dirname)

swig.setDefaults({ autoescape: false })
app.disable('x-powered-by')
app.engine('html', swig.renderFile)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'routes'))
app.use('/', express.static(path.join(__dirname, '/public')))

app.use(busboy())
app.use(bodyParser())
app.use(cookieParser())
app.use(routes)
