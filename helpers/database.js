var Sequelize = require('sequelize')
var config = require('../config.js')
var db = this

exports.sequelize = new Sequelize(
  config.dbparam.database,
  config.dbparam.user,
  config.dbparam.password,
  {
    host: config.dbparam.host,
    dialect: 'mysql',
    logging: config.dbparam.logging,
    timezone: '+02:00'
  }
)

/**
 * Inherit everything from dbnodebase
 */
exports.Game = this.sequelize.define('game', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  tavling: { type: Sequelize.STRING(50) },
  rubrik: { type: Sequelize.STRING(100) },
  logo: { type: Sequelize.STRING(100) },
  intro: { type: Sequelize.STRING(400) },
  info: { type: Sequelize.STRING(300) },
  descript: { type: Sequelize.STRING(200) },
  tips: { type: Sequelize.STRING(200) }
})

exports.Question = this.sequelize.define('question', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  tavlingid: { type: Sequelize.INTEGER },
  fraga1: { type: Sequelize.STRING(200) },
  fraga2: { type: Sequelize.STRING(200) },
  svar1: { type: Sequelize.STRING(200) },
  svar2: { type: Sequelize.STRING(200) },
  orderno: { type: Sequelize.INTEGER }
})

/**
 * Make associations
 */
exports.associate = function () {
  db.Game.hasMany(db.Question, { foreignKey: 'tavlingid' })
  db.Question.belongsTo(db.Game, { foreignKey: 'tavlingid' })
}

/**
 * If config.application.updateDatabase is set the database is checked for updates.
 */
db.associate()
