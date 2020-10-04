var db = require('../helpers/database.js')

exports.index = function (req, res, next) {
  db.Game.findAll({
    include: [{
      model: db.Question
    }],
    order: [[db.Question, 'orderno', 'asc']]
  }).then(function (games) {
    res.render('klurig', {
      games: games
    })
  })
}
