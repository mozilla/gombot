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
    sign: function(authKey, email, date, payload, cb) {
      setTimeout(cb, 0);
    }
  };
})();

if(typeof module != 'undefined' && module.exports){
  module.exports = GombotCrypto;
}
