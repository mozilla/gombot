var config = require('../etc/config.js');

module.exports = config.db.store === 'couchbase' ?
                  require('./db/couchbase') :
                  require('./db/json');
