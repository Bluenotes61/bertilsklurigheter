var Sequelize = require("sequelize");
var Q = require("q");    
var config = require("../config.js");  
var dbnodebase = require("../nodebase/helpers/database.js");  
var common = require("./common.js");  
var db = this;


/**
 * Inherit everything from dbnodebase
 */
for (objkey in dbnodebase) {
  exports[objkey] = dbnodebase[objkey];
}

exports.Game = this.sequelize.define('game', {
  id : { type:Sequelize.INTEGER, primaryKey:true, autoIncrement:true},
  tavling : { type : Sequelize.STRING(50) },
  rubrik : { type : Sequelize.STRING(100) },
  logo : { type : Sequelize.STRING(100) },
  intro : { type : Sequelize.STRING(400) },
  info : { type : Sequelize.STRING(300) },
  descript : { type : Sequelize.STRING(200) },
  tips : { type : Sequelize.STRING(200) }
}, 
{
  classMethods: { associate: function() {
    db.Game.hasMany(db.Question, { foreignKey:'tavlingid' });
  }}
});

exports.Question = this.sequelize.define('question', {
  id : { type:Sequelize.INTEGER, primaryKey:true, autoIncrement:true},
  tavlingid : { type : Sequelize.INTEGER },
  fraga1 : { type : Sequelize.STRING(200) },
  fraga2 : { type : Sequelize.STRING(200) },
  svar1 : { type : Sequelize.STRING(200) },
  svar2 : { type : Sequelize.STRING(200) },
  orderno : { type : Sequelize.INTEGER }
}, 
{
  classMethods: { associate: function() {
    db.Question.belongsTo(db.Game, { foreignKey:'tavlingid' });
  }}
});



/**
 * Make associations
 */
exports.associate = function() {
  Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db[modelName].associate();
    }
  });
}


/**
 * If config.application.updateDatabase is set the database is checked for updates.
 */
db.associate();
