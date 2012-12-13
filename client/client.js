if (typeof GombotCrypto === 'undefined') {
  var GombotCrypto = require('./crypto.js');
}
if (typeof URLParse === 'undefined') {
  var URLParse = require('./urlparse.js');
}

(function() {

GombotClient = function(path) {
  var url = URLParse(path);

  this.scheme = url.scheme;
  this.host   = url.host;
  this.port   = url.port;
  this.path   = url.path || '';
};

var xhr = typeof jQuery !== 'undefined' ? jQuery.ajax : require('xhrequest');

function request(args, cb) {
  var url = args.scheme ? args.scheme : 'http';
  var method = args.method.toUpperCase();
  url += '://' + args.host;
  if (args.port) url += ':' + args.port;
  url += args.path;

  var req = {
    url: url,
    method: method,
    type: method,
    data: args.data,
    //dataType: 'json',
    //accepts: {json: 'application/json'},
    headers: args.headers || {},
    success: function(data, res, status) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return cb('Invalid JSON response: ' + e);
        }
      }
      data.session_context = {};
      cb(null, data);
    },
    processData: false,
    error: function(data, res, status) {
      cb('Error: ' + data + '\nStatus: ' + status);
    }
  };
  if (method == 'PUT' || method == 'POST') {
    req.contentType = req.headers['Content-Type'] = 'application/json';
  }
  xhr(url, req);
}

function mergeArgs(args, def) {
  args.scheme = def.scheme;
  args.host = args.host || def.host;
  args.port = args.port || def.port;
  return args;
}

GombotClient.prototype = {
  // get "session context" from the server
  context: function(args, cb) {
    if (typeof args === 'function') {
      cb = args;
      args = {};
    }
    args = mergeArgs(args, this);
    args.method = 'get';
    args.path = this.path + '/v1/context';

    request(args, cb);
  },
  account: function(args, cb) {
    var self = this;
    args = mergeArgs(args, this);
    args.method = 'post';
    args.path = this.path + '/v1/account';

    // compute the authKey
    var headers = GombotCrypto.derive({
        email: args.email,
        password: args.pass
      }, function(err, r) {
        self.authKey = r.authKey;
        args.data = JSON.stringify({email: args.email, pass: r.authKey, newsletter: args.newsletter});
        // send request with authKey as the password
        request(args, cb);
      });
  },
  status: function(args, cb) {
    args = mergeArgs(args, this);
    args.method = 'get';
    args.path = this.path + '/v1/status';

    var url = args.scheme ? args.scheme : 'http';
    url += '://' + args.host;
    if (args.port) url += ':' + args.port;
    url += args.path;

    // compute the authKey
    GombotCrypto.sign({
        email: args.email,
        key: args.key,
        url: url,
        host: args.host,
        port: args.port,
        method: args.method,
        nonce: args.nonce,
        date: args.date
      }, function(err, r) {
        if (err) return cb(err);
        args.headers = r;
        // send request with authKey as the password
        request(args, cb);
      });
  }
};

})();

if (typeof module != 'undefined' && module.exports) {
  module.exports = GombotClient;
}
