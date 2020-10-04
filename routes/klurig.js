const path = require('path')
const fs = require('fs')

exports.index = function (req, res, next) {
  const fname = path.join(appRoot, 'helpers', 'games.json')
  fs.readFile(fname, 'utf8', (err, content) => {
    const games = JSON.parse(content)
    games.sort((g1, g2) => g1.orderNo - g2.orderNo)
    for (const game of games) {
      game.questions.sort((q1, q2) => q1.orderNo - q2.orderNo)
    }
    res.render('klurig', {
      games: games
    })
  })
}
