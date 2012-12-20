var db;

module.exports = {
  connect: function(options, cb) {
    setTimeout(function() {
      console.log('database connected');
      if (db) return cb(null);
      db = {};
      cb(null);
    }, 0);
    return this;
  },
  storeAlphaEmail: function(email, cb) {
    if (!db.alpha_users) db.alpha_users = {emails: []};

    if (db.alpha_users.emails.indexOf(email) < 0) {
      db.alpha_users.emails.push(email);
    }

    setTimeout(function() {
      cb(null);
    }, 0);
    return this;
  },
  stageAccount: function(data, cb) {
    var account = {
      pass: data.pass,
      email: data.email,
      newsletter: !!data.newsletter,
      staged: false
    };
    setTimeout(function() {
      if (db[data.email]) return cb("That email has already been used");
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
  },
  storePayload: function(id, payload, cb) {
    setTimeout(function() {
      db[id + '-payload'] = {payload: payload, timestamp: +new Date};
      cb(null);
    }, 0);
    return this;
  },
  getPayload: function(id, cb) {
    console.error(db[id+'-payload']);
    setTimeout(function() {
      cb(null, db[id + '-payload']);
    }, 0);
    return this;
  }
};
