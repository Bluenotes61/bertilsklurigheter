/**
 * Routers for requests from the standard page
 * @module routes/standardpage
 */
var db = require('../helpers/database.js')

/**
 * Responds to the get request /standard
 */
exports.index = function (req, res, next) {
  db.Game.findAll({
    logging: console.log,
    include: [{
      model: db.Question
    }],
    order: [[db.Question, 'orderno', 'asc']]
  }).then(function (games) {
    res.render('start', {
      games: games
    })
  })
}
