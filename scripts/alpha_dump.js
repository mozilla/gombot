var couchbase = require('couchbase');

var options = {
  'username': 'Administrator',
  'password': process.env.DB_PASSWORD || 'password',
  'hosts': ['localhost:8091'],
  'bucket': 'default'
};

couchbase.connect(options, function(err, bucket) {
  bucket.get('alpha_users', function (err, doc) {
    console.log('Alpha User Emails\n-----------------');
    console.log(doc.emails.join('\n'));
    process.exit();
  });
});
