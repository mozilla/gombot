var db;

module.exports = {
  connect: function(options, cb) {
    setTimeout(function() {
      if (db) return;
      db = {};
      cb(null);
    }, 0);
    return this;
  },
  stageAccount: function(data, cb) {
    var account = {
      pass: data.pass,
      email: data.email,
      staged: false
      //staged: true
    };
    setTimeout(function() {
      db[data.email] = account;
      cb(null);
    }, 0);
    return this;
  },
  getAuthKey: function(email, cb) {
    setTimeout(function() {
      cb(null, db[email].pass);
    }, 0);
    return this;
  }
};
