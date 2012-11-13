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
  stageAccount: function(data, cb) {
    var account = {
      pass: data.pass,
      email: data.email,
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
