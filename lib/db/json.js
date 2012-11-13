var db;

module.exports = {
  connect: function(options, cb) {
    setTimeout(function() {
      if (db) return;
      db = {};
      cb(null);
    }, 0);
  },
  stageAccount: function(data, cb) {
    var account = {
      pass: data.pass,
      email: data.email,
      staged: true
    };
    setTimeout(function() {
      db[data.email] = account;
      cb(null);
    }, 0);
    return this;
  }
};
