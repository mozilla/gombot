
if (typeof sjcl === 'undefined') {
  var sjcl = require('./sjcl.js');
}

if (typeof URLParse === 'undefined') {
  var URLParse = require('./urlparse.js');
}

var GombotCrypto = (function() {
  // the number of rounds used in PBKDF2 to generate a stretched derived
  // key from a user password.
  var PBKDF2_ROUNDS = 250000;

  // output length of stretch itermediate derived key (from which
  // keyCrypt and keyAuth are derived) - 256 bits, the same as the
  // sha-256 hash function
  var PBKDF2_OUTPUT_LENGTH_BITS = 32 * 8;

  // salt string for derivation of keyAuth
  var AUTH_SALT_STRING = "identity.mozilla.com/gombot/v1/authentication";

  // salt string for derivation of keyCrypt
  var CRYPT_SALT_STRING = "identity.mozilla.com/gombot/v1/encryption";

  // methods supported for request signing
  var SUPPORTED_METHODS = {
    GET: true,
    POST: true,
    PUT: true,
    DELETE: true
  };

  return {
    seed: function(entropy, cb) {
      setTimeout(cb, 0);
    },
    derive: function(args, cb) {
      args = args || {};

      if (typeof args.email !== 'string' || typeof args.password !== 'string')
        throw new Error("missing required parameters");

      if (typeof cb !== 'function')
        throw new Error("missing required callback parameter");

      // yes, this async break is artificial for now, but is web worker
      // compatible in the future.
      setTimeout(function() {
        var saltBits = sjcl.codec.utf8String.toBits(args.email);
        var derivedKey = sjcl.misc.pbkdf2(args.password,
                                          saltBits,
                                          PBKDF2_ROUNDS,
                                          PBKDF2_OUTPUT_LENGTH_BITS);

        // XXX: for now we're doing another round of PBKDF2 to derive authKey and
        // cryptKey.  We should be doing HKDF?
        var rv = {};
        var authSaltBits = sjcl.codec.utf8String.toBits(AUTH_SALT_STRING);
        rv.authKey = sjcl.misc.pbkdf2(derivedKey,
                                      authSaltBits,
                                      1,
                                      PBKDF2_OUTPUT_LENGTH_BITS);
        var cryptSaltBits = sjcl.codec.utf8String.toBits(CRYPT_SALT_STRING);
        rv.cryptKey = sjcl.misc.pbkdf2(derivedKey,
                                      cryptSaltBits,
                                      1,
                                      PBKDF2_OUTPUT_LENGTH_BITS);

        // always return content to the client as base64 encoded strings.
        rv.authKey = sjcl.codec.base64.fromBits(rv.authKey);
        rv.cryptKey = sjcl.codec.base64.fromBits(rv.cryptKey);

        cb(null, rv);
      }, 0);
    },
    encrypt: function(cryptKey, plainText, cb) {
      setTimeout(cb, 0);
    },
    decrypt: function(cryptKey, cipherText, cb) {
      setTimeout(cb, 0);
    },
    sign: function(args, cb) {
      var SUPPORTED_METHODS = {
        GET: true,
        POST: true,
        PUT: true,
        DELETE: true
      };

      args = args || {};
      // if date is provided as an object, let's round to seconds since
      // epoch
      if (typeof args.date === 'object' && args.date.getTime) {
        args.date = Math.round(args.date.getTime() / 1000);
      }
      // payload may be omitted (as for GET requests)
      if (!args.payload) args.payload = '';

      if (typeof args.key !== 'string')
        throw new Error(".key is required and must be a string");
      if (typeof args.email !== 'string')
        throw new Error(".email is required and must be a string");
      if (typeof args.date !== 'number')
        throw new Error(".date is required and must be a javascript Date object or an integer representing seconds since epoch");
      if (typeof args.payload !== 'string')
        throw new Error(".payload must be a string if supplied");
      if (typeof args.url !== 'string')
        throw new Error(".url is required and must be a string");
      if (typeof args.method !== 'string' ||
          !SUPPORTED_METHODS[args.method.toUpperCase()])
        throw new Error(".method must be an allowable HTTP method");
      if (typeof args.nonce !== 'string')
        throw new Error(".nonce should be a random string");
      if (typeof cb !== 'function')
        throw new Error("missing required callback argument");

      // how about if the key is poorly formated?
      var keyBits = sjcl.codec.base64.toBits(args.key);

      // normalize method
      args.method = args.method.toUpperCase();

      args.url = URLParse(args.url);
      // add a port if default is in use
      if (!args.url.port) {
        args.url.port = (args.url.scheme === 'https' ? '443' : '80');
      }

      setTimeout(function() {
        // see https://tools.ietf.org/html/draft-ietf-oauth-v2-http-mac-01
        // for normalization procedure
        var hmac = new sjcl.misc.hmac(keyBits);
        var body =
          // string representation of seconds since epoch
          args.date.toString() + "\n" +
          // random nonce
          args.nonce + '\n' +
          // normalized method
          args.method + '\n' +
          // path
          args.path + '\n' +
          // hostname
          args.host + '\n' +
          // port
          args.port + '\n' +
          // payload
          args.payload + '\n';

        var mac = sjcl.codec.base64.fromBits(hmac.mac(body));

        // now formulate the authorization header.
        var val =
          'MAC id="' + args.email + '", ' +
          'ts="' + args.date + '", ' +
          'nonce="' + args.nonce + '", ' +
          'mac="' + mac + '"';

        var headers = { "Authorization": val };

        // and pass a bag of calculated authorization headers (only one)
        // back to the client
        cb(null, headers);
      }, 0);
    }
  };
})();

if(typeof module != 'undefined' && module.exports){
  module.exports = GombotCrypto;
}
