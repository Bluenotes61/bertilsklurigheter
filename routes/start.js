/**
 * Routers for requests from the standard page
 * @module routes/standardpage
 */

var db = require("../helpers/database.js");
var common = require("../helpers/common.js");
var config = require("../config.js");
var Q = require("q");
var standardpage = this;
 
  
/**
 * Responds to the get request /standard
 */
exports.index = function(req, res, next) {
  db.Game.findAll({
    include:[{
      model:db.Question
    }],
    order:[[db.Question, "orderno", "asc"]]
  }).then(function(games){
    res.render("start", { 
      games:games
    });
  })
};
