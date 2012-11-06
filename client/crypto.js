var GombotCrypto = (function() {
  // constants
  var PBKDF2_ROUNDS = 250000;
  var PBKDF2_OUTPUT_LENGTH_BITS = 32 * 8;
  var AUTH_SALT_STRING = "identity.mozilla.com/gombot/v1/authentication";
  var CRYPT_SALT_STRING = "identity.mozilla.com/gombot/v1/encryption";

  if (typeof sjcl === 'undefined') {
    var sjcl = require('./sjcl.js');
  }

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
      args = args || {};
      // if date is provided as an object, let's round to seconds since
      // epoch
      if (typeof args.date === 'object' && args.date.getTime) {
        args.date = Math.round(args.date.getTime() / 1000);
      }

      if (typeof args.key !== 'string')
        throw new Error(".key is required and must be a string");
      if (typeof args.email !== 'string')      
        throw new Error(".email is required and must be a string");
      if (typeof args.date !== 'number')      
        throw new Error(".date is required and must be a javascript Date object");
      if (typeof args.payload !== 'string')
        throw new Error(".payload is required and must be a string");
      if (typeof cb !== 'function')
        throw new Error("missing required callback argument");

      // how about if the key is poorly formated?
      var keyBits = sjcl.codec.base64.toBits(args.key);
      
      setTimeout(function() {
        var hmac = new sjcl.misc.hmac(keyBits);
        var bits = hmac.mac(args.date.toString() + "\n" +
                            args.email + "\n" + 
                            args.payload);
        cb(null, sjcl.codec.base64.fromBits(bits));
      }, 0);
    }
  };
})();

if(typeof module != 'undefined' && module.exports){
  module.exports = GombotCrypto;
}
