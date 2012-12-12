var couchbase = require('couchbase');

var db;

module.exports = {
  connect: function(options, cb) {
    console.error('options', options);
    couchbase.connect(options, function(err, bucket) {
      console.error('connection fail!!!', err);
      if (err) cb(err);
      db = bucket;
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
    var account = {
      pass: data.pass,
      email: data.email,
      newsletter: !!data.newsletter,
      staged: true
    };
    db.set(data.email, account, function (err, meta) {
      console.log('meta', meta);
      if (err) cb(err);
      else cb(null, meta);
    });
    return this;
  }
};
