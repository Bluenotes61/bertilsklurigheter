/**
 * Module containtng common server functionality
 * @module helpers/common
 */

var db = require("./database.js"); 
var commonnodebase = require("../nodebase/helpers/common.js")
var Q = require("q");
var common = this;

for (objkey in commonnodebase) {
  exports[objkey] = commonnodebase[objkey];
}


/**
 * Promise to return the path to the location of css and graphics for the given clinic
 * @param  {int} for (objkey in commonnodebase) {
  exports[objkey] = commonnodebase[objkey];
}

clinicid Id of the clinic
 * @return {promise} Resolves the path
 */
exports.getGrafikPath = function(clinicid) {
  var d = Q.defer();
  db.Clinic.findOne({
    attributes: ["grafik"],
    where: { id: clinicid }
  }).then(
    function(clinic) {
      var path = (clinic ? clinic.grafik : "");
      d.resolve(path);
    },
    function(err) {
      d.reject(err);
    }
  );
  return d.promise;
};

/**
 * Log an activity event to the databse
 * @param  {Request} req Request object for retrieving the logged in user
 * @param  {string} eventtype Type of event
 * @param  {int} identifier Identifier of the item which the event concerns
 * @param  {string} info More info about the item which the event concerns
 */
exports.logEvent = function(req, eventtype, identifier, info) {
  if (eventtype.length > 45) eventtype = eventtype.substring(0, 45);
  identifier = parseInt(identifier);
  if (isNaN(identifier)) identifier = 0;
  info = (info || "");
  if (info.length > 45) info = info.substring(0, 45);
  var id = (req ? (req.session ? (req.session.user ? req.session.user.id : "") : "") : "");
  var ip = (req ? (req.connection ? req.connection.remoteAddress : "") : "");
  db.EventLog.create({
    ip: ip,
    userid: id,
    eventtype: eventtype,
    identifier: identifier,
    info: info
  }).then(
    function() {},
    function(err) {
      common.logError(req, err);
    }
  );
};


/**
 * Reformats a personal number form plain database format to standard format
 * @param  {String} pnr Format: ÅÅÅÅMMDDXXXX
 * @return {String} Format: ÅÅMMDD-XXXX or ÅÅMMDD+XXXX
 */
exports.pnumberFromPlain = function(pnr) {
  if (!pnr || pnr.length < 12) return "";
  var birthDate = new Date(pnr.substr(0, 4) + "-" + pnr.substr(4,2) + "-" + pnr.substr(6,2));
  if (isNaN(birthDate.getTime())) return "";

  var today = new Date();
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    age--;

  var sep = (age >= 100 ? "+" : "-");
  return pnr.slice(2, 8) + sep + pnr.slice(8);
};


/**
 * Week number for current date
 * @return {int} Week number
 */
exports.getCurrWeekNumber = function(){
  var d = new Date(); 
  d.setHours(0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};


exports.getAvailableClinicTabs = function(clinicid, pnumber, vardplan) {
  var d = Q.defer();
  var tabs = {};
  db.UsedTab.findAll({
    where: {
      type: 'clinic',
      isvardplan: vardplan,
      clinicid: clinicid
    },
    include: [{
      model: db.Tab,
      attributes: ["name", "title", ["clinictemplate", "template"]]
    }]
  }).then(function(rows){
    tabs.usertabs = [];
    for (var i=0; i < rows.length; i++) 
      tabs.usertabs.push(common.cloneObject(rows[i].tab));
    return common.getAvailablePatientTabs(pnumber, vardplan);
  }).then(
    function(ptabs) {
      tabs.patienttabs = {};
      for (var i=0; i < ptabs.length; i++) 
        tabs.patienttabs[ptabs[i].name] = true;
      d.resolve(tabs);
    },
    function(err) {
      d.reject(err);
    }
  );
  return d.promise;
}
 
exports.getAvailablePatientTabs = function(pnumber, vardplan) {
  var d = Q.defer();
  db.UsedTab.findAll({
    where: {
      type: 'patient',
      isvardplan: vardplan
    },
    include: [
      {
        model: db.Tab,
        attributes: ["name", "title", ["patienttemplate", "template"]]
      }
    ]
  }).then(
    function(rows) {
      var tabs = [];
      for (var i=0; i < rows.length; i++)
        tabs.push(JSON.parse(JSON.stringify(rows[i].tab)));
      d.resolve(tabs);
    },
    function(err) {
      d.reject(err);
    }
  );
  return d.promise;
}

/**
 * Returns the standard intro of a Vårdplan in the language given
 * @param  {string} lang Language
 * @return {promise} Resolves to html for the intro
 */
exports.getRCCIntro = function(lang) {
  var d = Q.defer();
  db.ItemInfo.findOne({
    attributes: ["info"],
    where: {
      parentid: 0,
      type: 'general',
      name: 'rccintro',
      languageid: lang
    }
  }).then(
    function(item) {
      d.resolve(item ? item.info : "");
    },
    function(err) {
      common.logError(null, err);
      d.resolve("");
    }
  );
  return d.promise;
}


/**
 * Return translations for the given language
 * @param  {string} lang Language
 * @return {Promise} Resolves to an object like {'Datum':'Date', 'Telefon':'Phone', ...}
 */
exports.getTranslations = function(lang) {
  var d = Q.defer();
  lang = lang || 'sv';
  db.Translation.findAll({
    attributes: ["sv", lang]
  }).then(
    function(rows){
      var trans = {};
      for (var i=0; i < rows.length; i++)  
        trans[rows[i].sv] = rows[i][lang];
      d.resolve(trans);
    },
    function(err) {
      d.reject(err);
    }
  );
  return d.promise;
}
