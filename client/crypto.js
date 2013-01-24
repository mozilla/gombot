
if (typeof sjcl === 'undefined') {
  var sjcl = require('./sjcl-with-cbc.js');
  //var Hawk = require('hawk');
}

if (typeof URLParse === 'undefined') {
  var URLParse = require('./urlparse.js');
}

var GombotCrypto = (function() {

  var setTimeout;
  // determine if setTimeout is in global scope, and if not import then
  // import from timers module
  if (typeof window !== 'undefined' && typeof window.setTimeout === "function") {
    setTimeout = window.setTimeout;
  } else if (typeof self !== "undefined" && typeof self.setTimeout === "function") {
    setTimeout = self.setTimeout; // for Web Workers
  } else {
    setTimeout = require('timers').setTimeout;
  }

  // create a worker to perform crypto computations
  var worker;
  if (typeof Worker !== 'undefined') {
    worker = new Worker('../../server/client/worker.js');
    worker.onmessage = function(event) {
      var data = event.data;
      if (typeof data.id !== 'undefined') {
        //console.log('event', event);
        if (data.err) cmds[data.id](data.err);
        else cmds[data.id](null, data.result);
        delete cmds[data.id];
      } else console.log(data);
    };
    worker.onerror = function(event) {
      console.log(event);
    };
  }

  var cmdIds = 0;
  var cmds = {};
  function doWork (cmd, args, cb) {
    var id = cmdIds;
    cmds[cmdIds++] = cb || function() {};
    //console.log('dowork', { cmd: cmd, args: args, id: id });
    worker.postMessage({ cmd: cmd, args: args, id: id });
  }

  // we use an HMAC tag to check message integrity, to use CBC safely
  sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

  // the number of rounds used in PBKDF2 to generate a stretched derived
  // key from a user password.
  var PBKDF2_ROUNDS = 250000;

  // output length of stretch itermediate derived key (from which
  // keyCrypt and keyAuth are derived) - 256 bits, the same as the
  // sha-256 hash function
  var PBKDF2_OUTPUT_LENGTH_BITS = 32 * 8;

  var MASTER_SALT_PREFIX_STRING = "identity.mozilla.com/gombot/v1/master:";

  // salt string for derivation of keys.authKey (for HAWK)
  var AUTH_SALT_STRING = "identity.mozilla.com/gombot/v1/authentication";

  // salt string for derivation of keys.aesKey
  var AES_SALT_STRING = "identity.mozilla.com/gombot/v1/data/AES";

  // and for derivation of keys.hmacKey
  var HMAC_SALT_STRING = "identity.mozilla.com/gombot/v1/data/HMAC";

  var GOMBOT_VERSION_PREFIX = "identity.mozilla.com/gombot/v1/data:";

  // methods supported for request signing
  var SUPPORTED_METHODS = {
    GET: true,
    POST: true,
    PUT: true,
    DELETE: true
  };

  return {
    hexToBase64: function (hex) {
      return sjcl.codec.base64.fromBits(sjcl.codec.hex.toBits(hex));
    },
    seed: function(entropy, cb) {
      if (worker) return doWork('seed', entropy, cb);

      if (typeof window !== 'undefined') sjcl.random.startCollectors();
      sjcl.random.addEntropy(entropy, entropy.length * 6, 'server');
      if (!sjcl.random.isReady())
        return cb(new Error("sjcl seeded with insufficient entropy"));
      setTimeout(cb, 0);
    },
    derive: function(args, cb) {
      if (worker) return doWork('derive', args, cb);

      args = args || {};

      if (typeof args.email !== 'string' || typeof args.password !== 'string')
        throw new Error("missing required parameters");

      if (typeof cb !== 'function')
        throw new Error("missing required callback parameter");

      // yes, this async break is artificial for now, but is web worker
      // compatible in the future.
      setTimeout(function() {
        var pbkdf2 = sjcl.misc.pbkdf2;
        var bA = sjcl.bitArray;
        var str2bits = sjcl.codec.utf8String.toBits;
        var secret = str2bits(""); // for the future
        var masterSecret = bA.concat(bA.concat(secret, str2bits(":")),
                                     str2bits(args.password));
        var saltBits = bA.concat(str2bits(MASTER_SALT_PREFIX_STRING),
                                 str2bits(args.email));
        var masterKey = pbkdf2(masterSecret, saltBits,
                               PBKDF2_ROUNDS, PBKDF2_OUTPUT_LENGTH_BITS);
        // derive the three other keys from this master. Return them as hex.
        var bits2hex = sjcl.codec.hex.fromBits;
        var keys = {};
        keys.authKey = bits2hex(pbkdf2(masterKey, str2bits(AUTH_SALT_STRING),
                                       1, PBKDF2_OUTPUT_LENGTH_BITS));
        keys.aesKey = bits2hex(pbkdf2(masterKey, str2bits(AES_SALT_STRING),
                                      1, PBKDF2_OUTPUT_LENGTH_BITS));
        keys.hmacKey = bits2hex(pbkdf2(masterKey, str2bits(HMAC_SALT_STRING),
                                       1, PBKDF2_OUTPUT_LENGTH_BITS));
        cb(null, keys);
      }, 0);
    },
    encrypt: function(keys, plainText, cb) {
      if (worker) return doWork('encrypt', { keys: keys, payload: plainText }, cb);

      setTimeout(function() {
        var bA = sjcl.bitArray;
        var str2bits = sjcl.codec.utf8String.toBits;
        var bits2b64 = sjcl.codec.base64.fromBits;
        var hex2bits = sjcl.codec.hex.toBits;
        if (!sjcl.random.isReady())
          return cb(new Error("sjcl.random is not ready, cannot create IV"));
        var IV = sjcl.random.randomWords(16/4);
        var ct = sjcl.mode.cbc.encrypt(new sjcl.cipher.aes(hex2bits(keys.aesKey)),
                                       str2bits(plainText), IV);
        var msg = bA.concat(bA.concat(str2bits(GOMBOT_VERSION_PREFIX), IV), ct);
        var mac = new sjcl.misc.hmac(hex2bits(keys.hmacKey),
                                     sjcl.hash.sha256).mac(msg);
        var msgmac_b64 = bits2b64(bA.concat(msg, mac));
        cb(null, msgmac_b64);
      }, 0);
    },
    decrypt: function(keys, cipherText, cb) {
      if (worker) return doWork('decrypt', { keys: keys, payload: cipherText }, cb);

      setTimeout(function() {
        var bA = sjcl.bitArray;
        var str2bits = sjcl.codec.utf8String.toBits;
        var bits2str = sjcl.codec.utf8String.fromBits;
        var b642bits = sjcl.codec.base64.toBits;
        var hex2bits = sjcl.codec.hex.toBits;
        var msgmac = b642bits(cipherText);
        var prefixBits = str2bits(GOMBOT_VERSION_PREFIX);
        var prelen = bA.bitLength(prefixBits);
        var gotPrefix = bA.bitSlice(msgmac, 0, prelen);
        if (!bA.equal(gotPrefix, prefixBits))
          return cb(new Error("unrecognized version prefix '"+bits2str(gotPrefix)+"'"));
        var macable = bA.bitSlice(msgmac, 0, bA.bitLength(msgmac)-32*8);
        var expectedMac = new sjcl.misc.hmac(hex2bits(keys.hmacKey),
                                             sjcl.hash.sha256).mac(macable);
        var gotMac = bA.bitSlice(msgmac, bA.bitLength(msgmac)-32*8);
        if (!bA.equal(expectedMac, gotMac)) // this is constant-time
          return cb(new Error("Corrupt encrypted data"));
        var IV = bA.bitSlice(macable, prelen, prelen+16*8);
        var msg = bA.bitSlice(macable, prelen+16*8);
        var plaintext = sjcl.mode.cbc.decrypt(new sjcl.cipher.aes(hex2bits(keys.aesKey)), msg, IV);

        cb(null, bits2str(plaintext));
      }, 0);
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

      if (!args.keys || typeof args.keys.authKey !== 'string')
        throw new Error(".keys.authKey is required and must be a string");
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

      // normalize method
      args.method = args.method.toUpperCase();

      // how about if the key is poorly formated?
      var keyBits = sjcl.codec.hex.toBits(args.keys.authKey);

      var url = URLParse(args.url);
      // add a port if default is in use
      if (!url.port) {
        url.port = (url.scheme === 'https' ? '443' : '80');
      }

      var hash = null;
      if (args.payload) {
        var bitArray = sjcl.hash.sha256.hash(args.payload);
        hash = sjcl.codec.hex.fromBits(bitArray);
      }

      setTimeout(function() {
        if (typeof Hawk === 'undefined') {
          var hmac = new sjcl.misc.hmac(keyBits);
          var body = 'hawk.1.header\n' +
            // string representation of seconds since epoch
            args.date.toString() + "\n" +
            // random nonce
            args.nonce + '\n' +
            // normalized method
            args.method + '\n' +
            // path
            url.path + (url.query ? '?' + url.query : '') + '\n' +
            // hostname
            url.host + '\n' +
            // port
            url.port + '\n' +
            // hash of body
            (hash || '') + '\n' +
            // extra app data
            (args.ext || '') + '\n';

          var mac = sjcl.codec.base64.fromBits(hmac.mac(body));
          var header = 'Hawk id="' + args.email +
                      '", ts="' + args.date +
                      '", nonce="' + args.nonce +
                      (hash ? '", hash="' + hash : '') +
                      (args.ext ? '", ext="' + args.ext : '') +
                      '", mac="' + mac + '"';
          var headers = {
            Authorization: header
          };
        } else {
          var credentials = {
            id: args.email,
            key: new Buffer(args.keys.authKey, 'hex'),
            algorithm: 'sha256'
          };

          var headers = {
            Authorization: Hawk.getAuthorizationHeader(credentials, args.method, args.url, url.host, url.port, args.nonce, args.date)
          };
        }

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
