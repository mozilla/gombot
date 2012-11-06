var GombotCrypto = (function() {
  if (typeof sjcl === 'undefined') {
    var sjcl = require('./sjcl.js');
  }

  return {
    seed: function(entropy, cb) {
      setTimeout(cb, 0);
    },
    derive: function(email, password, cb) {
      setTimeout(cb, 0);
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
