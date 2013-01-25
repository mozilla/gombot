if (typeof GombotCrypto === 'undefined') {
  var GombotCrypto = require('./crypto.js');
}
if (typeof URLParse === 'undefined') {
  var URLParse = require('./urlparse.js');
}

(function() {

GombotClient = function(path, options) {
  if (!options) options = {};
  var url = URLParse(path);

  this.scheme = url.scheme;
  this.host   = url.host;
  this.port   = url.port;
  this.path   = url.path || '';

  this.user = options.user;
  this.keys = options.keys;

  // allow instantiators to supply own implementation of KDF function
  this.derive = options.kdfDerive || function(args, cb) {
    GombotCrypto.derive(args, cb);
  };
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
          return cb && cb('Invalid JSON response: ' + e);
        }
      }
      data.session_context = {};
      if (cb) cb(null, data);
    },
    processData: false,
    error: function(data, res, status) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return cb && cb('Invalid JSON response: ' + e);
        }
      }
      if (cb) cb({ error: data, status: status });
    },
    complete: function () {
      //console.log('request complete');
    }
  };
  if (method == 'PUT' || method == 'POST') {
    req.contentType = req.headers['Content-Type'] = 'application/json';
  }
  xhr(url, req);
}

function authRequest(args, cb) {
  var url = args.scheme ? args.scheme : 'http';
  url += '://' + args.host;
  if (args.port) url += ':' + args.port;
  url += args.path;
  // compute the authKey
  GombotCrypto.sign({
      email: args.email,
      keys: args.keys,
      url: url,
      host: args.host,
      port: args.port,
      method: args.method,
      nonce: args.nonce || 'unused',
      date: args.date || new Date()
    }, function(err, r) {
      if (err) return cb(err, r);
      args.headers = r;
      // send request with authKey as the password
      request(args, cb);
    });
}

function mergeArgs(args, def) {
  args.scheme = def.scheme;
  args.host   = args.host || def.host;
  args.port   = args.port || def.port;
  args.keys   = args.keys || def.keys;
  args.email  = args.email || def.user;
  return args;
}

GombotClient.prototype = {
  toJSON: function() {
    return { user: this.user, keys: this.keys };
  },

  // get "session context" from the server
  context: function(args, cb) {
    if (typeof args === 'function') {
      cb = args;
      args = {};
    }
    args        = mergeArgs(args, this);
    args.method = 'get';
    args.path   = this.path + '/v1/context';

    request(args, function (err, data) {
      if (err && cb) return cb(err);
      GombotCrypto.seed(data.entropy, function() {
        if (cb) cb(null, data);
      });
    });
  },
  // create an account
  account: function(args, cb) {
    var self = this;

    args        = mergeArgs(args, this);
    args.method = 'post';
    args.path   = this.path + '/v1/account';

    // compute the authKey
    var headers = this.derive({
        email: args.email,
        password: args.pass
      }, function(err, r) {
        self.keys = r;
        self.user = args.email;

        self.createEncryptedPayload(args.payload, function (err, ciphertext) {
          args.data = JSON.stringify({email: args.email, pass: GombotCrypto.hexToBase64(r.authKey), payload: ciphertext, newsletter: args.newsletter});
          // send request with authKey as the password
          request(args, cb);
        });
      });
  },
  // check auth status
  status: function(args, cb) {
    args        = mergeArgs(args, this);
    args.method = 'get';
    args.path   = this.path + '/v1/status';

    authRequest(args, cb);
  },
  // derives auth key using credentials then checks
  // auth status using derived keys
  signIn: function(args, cb) {
    var self = this;
    // compute the authKey
    this.derive({
        email: args.email,
        password: args.pass
      }, function(err, r) {
        if (err) return cb(err);
        var keys = args.keys = r;

        self.status(args, function (err, r) {
          if (!err && r.success) {
            self.keys = keys;
            self.user = args.email;
          }
          if (cb) cb(err, r);
        });
      });
  },

  // update
  storeEncryptedPayload: function(args,cb) {
    args        = mergeArgs(args, this);
    args.method = 'put';
    args.path   = this.path + '/v1/payload';
    args.data = JSON.stringify({payload: args.ciphertext});
    authRequest(args, cb);
  },

  createEncryptedPayload: function(payload, cb) {
    GombotCrypto.encrypt(this.keys, JSON.stringify(payload), function (err, ciphertext) {
      if (err) return cb(err);
      cb(null, ciphertext);
    });
  },
  // update
  storePayload: function(args, cb) {
    args        = mergeArgs(args, this);
    var self = this;
    this.createEncryptedPayload(args.payload, function(err, ciphertext) {
      if (err) return cb(err);
      args.ciphertext = ciphertext;
      self.storeEncryptedPayload(args,cb);
    });
  },
  decryptPayload: function(encryptedPayload, cb) {
    GombotCrypto.decrypt(this.keys, encryptedPayload, function (err, plaintext) {
      if (err) return cb(err);
      cb(null, plaintext);
    });
  },
  // read
  getPayload: function(args, cb) {
    args        = mergeArgs(args, this);
    args.method = 'get';
    args.path   = this.path + '/v1/payload' + '?updated=' + (args.updated || 0);

    var keys = this.keys;
    var self = this;
    authRequest(args, function (err, data) {
      if (err) return cb(err);
      if (data.sync) {
        GombotCrypto.decrypt(keys, data.payload, function (err, plaintext) {
          if (err) return cb(err);
          cb(null, {success: data.success, payload: JSON.parse(plaintext), updated: data.updated, ciphertext: data.payload });
        });
      } else {
        // both will be null
        data.ciphertext = data.payload;
        cb(null, data);
      }
    });
  },
  getTimestamp: function(args, cb) {
    args        = mergeArgs(args, this);
    args.method = 'get';
    args.path   = this.path + '/v1/payload/timestamp';

    authRequest(args, cb);
  },
  isAuthenticated: function() {
    return this.user && this.keys === Object(this.keys);
  }
};


})();

if (typeof module != 'undefined' && module.exports) {
  module.exports = GombotClient;
}
