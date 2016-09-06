/**
 * Start module for the application
 */  
                                      
var express = require('express');  
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var busboy = require('connect-busboy');  
var swig = require("swig");
var routes = require("./nodebase/middleware/routes.js");  
var session = require("./nodebase/helpers/sessions.js");
var db = require("./helpers/database.js");
var config = require("./config.js");  
var path = require('path');  

var app = express();     
  
var server = app.listen(config.serverport, function() {
  console.log('Listening on port %d', server.address().port);
});      

global.appRoot = path.resolve(__dirname);

swig.setDefaults({ autoescape: false });  
app.disable('x-powered-by');
app.engine("html", swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/routes');  
app.use("/", express.static(__dirname + '/public'));
app.use("/nodebase", express.static(__dirname + '/nodebase/public'));

app.use(busboy());           
app.use(bodyParser());    
app.use(cookieParser());  
app.use(session.config);
app.use(routes);
