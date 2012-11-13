;(function() {

GombotClient = function(host, port) {
  this.host = host;
  this.port = port;
};

var xhr = typeof jQuery !== 'undefined' ? jQuery.ajax : require('xhrequest');

if (typeof GombotCrypto === 'undefined') {
  var GombotCrypto = require('./crypto.js');
}

function request(args, cb) {
  var url = args.scheme ? args.scheme : 'http';
  var method = args.method.toUpperCase();
  url += '://' + args.host;
  if (args.port) url += ':' + args.port;
  url += args.path;

  var req = {
    url: url,
    method: method,
    data: args.data,
    headers: {},
    success: function(data, res, status) {
      try {
        var body = JSON.parse(data);
      } catch (e) {
        return cb('Invalid JSON response: ' + e);
      }
      body.session_context = {};
      cb(null, body);
    },
    error: function(data, res, status) {
      cb('Error: ' + data + '\nStatus: ' + status);
    }
  };
  if (method == 'PUT' || method == 'POST') {
    req.headers['Content-Type'] = 'application/json';
  }
  xhr(url, req);
}

GombotClient.prototype = {
  // get "session context" from the server
  context: function(args, cb) {
    if (typeof args === 'function') {
      cb = args;
      args = {};
    }
    args.host = args.host || this.host;
    args.port = args.port || this.port;
    args.method = 'get';
    args.path = '/v1/context';

    request(args, cb);
  },
  account: function(args, cb) {
    args.host = args.host || this.host;
    args.port = args.port || this.port;
    args.method = 'put';
    args.path = '/v1/account';

    // compute the authKey
    var keys = GombotCrypto.derive({
        email: args.email,
        password: args.password
      }, function(err, r) {
        args.data = JSON.stringify({email: args.email, pass: r.authKey});
        // send request with authKey as the password
        request(args, cb);
      });
  }
};

})();

if (typeof module != 'undefined' && module.exports) {
  module.exports = GombotClient;
}
