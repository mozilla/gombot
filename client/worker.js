URLParse = null;
sjcl = null;
// import sjcl, URLParse, and GombotCrypto
importScripts('sjcl-with-cbc.js');
window = {};
importScripts('urlparse.js');
URLParse = window.URLParse;
window = undefined;
importScripts('crypto.js');

onmessage = function (event) {
  var data = event.data;
  var cmd = data.cmd;
  var id = data.id;

  switch (cmd) {
    case 'seed':
      GombotCrypto.seed(data.args, function (err, r) {
        postMessage({ id: id, err: err && err.toString(), result: r });
      });
      break;
    case 'derive':
      GombotCrypto.derive(data.args, function (err, r) {
        postMessage({ id: id, err: err && err.toString(), result: r });
      });
      break;
    case 'sign':
      GombotCrypto.sign(data.args, function (err, r) {
        postMessage({ id: id, err: err && err.toString(), result: r });
      });
      break;
    case 'encrypt':
      GombotCrypto.encrypt(data.args.keys, data.args.payload, function (err, r) {
        postMessage({ id: id, err: err && err.toString(), result: r });
      });
      break;
    case 'decrypt':
      GombotCrypto.decrypt(data.args.keys, data.args.payload, function (err, r) {
        postMessage({ id: id, err: err && err.toString(), result: r });
      });
      break;
  }
};
