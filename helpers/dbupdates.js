var db = require("./database.js"); 
var dbnodeupdates = require("../nodebase/helpers/dbupdates.js"); 
var Q = require("q");

/**
 * Updates to the database are made if missing updates are found
 */
exports.update = function() {
  var d = Q.defer();
  db.sequelize.sync().then(function(){
    db.associate();
    return dbnodeupdates.update();
  }).then(function(){
    var updates = [
      addRequests,
    ];
    var promise = Q();
    updates.forEach(function (f) {
      promise = promise.then(f);
    });
    return promise;
  }).then(
    function(){
      d.resolve();
    },
    function(err) {
      d.reject(err);
    }
  );
  return d.promise;
}

/**
 * Adds the request /nodebase/roles
 */
function addRequests() {
  var promises = [
    dbnodeupdates.addOneRequest({url: '/', method:'get', pagetitle:'', srcfile:'routes/start', srcfunction:'index'}, [])
  ];
  return Q.all(promises)
}
