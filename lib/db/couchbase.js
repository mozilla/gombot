var couchbase = require('couchbase');

var db;

var onError = function(e){
  console.log('Couchbase error: ' + e);
};

module.exports = {
  connect: function(options, cb) {
    couchbase.connect(options, function(err, bucket) {
      console.log('database connected');
      if (db) return cb(null);
      if (err) return cb(err);
      db = bucket;
      db.on('error', onError);
      cb(null);
    });
    return this;
  },
  storeAlphaEmail: function(email, cb) {
    db.get('alpha_users', function (err, doc, meta) {
      if (!doc) doc = {emails: []};

      if (doc.emails.indexOf(email) < 0) {
        doc.emails.push(email);
      }

      db.set('alpha_users', doc, meta, function(err) {
        cb(err);
      });
    });
    return this;
  },
  stageAccount: function(data, cb) {
    db.get(data.email, function (err, doc, meta) {
      if (doc) return cb("That email has already been used");
      var account = {
        pass: data.pass,
        email: data.email,
        newsletter: !!data.newsletter,
        staged: false
      };
      db.set(data.email, account, function (err, meta) {
        console.log('meta', meta);
        if (err) cb(err);
        else cb(null, meta);
      });
    });
    return this;
  },
  getAuthKey: function(email, cb) {
    db.get(email, function (err, doc, meta) {
      if (err) return cb(err);
      if (!doc) return cb('No account found for ' + email);
      cb(null, doc.pass);
    });
    return this;
  }
};
