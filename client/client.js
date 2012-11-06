GombotClient = (function() {
  if (!XMLHttpRequest) var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

  function request(args, cb) {
    var req = new XMLHttpRequest();
    var url = args.scheme ? args.scheme : 'http';
    url += "://" + args.host;
    if (args.port) url += ":" + args.port;
    url += args.path;
    req.open(args.method.toUpperCase(), url, false);
    var resp = {
      headers: {},
      body: null
    };
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        try {
          resp.body = JSON.parse(req.responseText);
        } catch(e) {
          if (cb) {
            cb("couldn't parse JSON body: " + e);
            cb = null;
          }
        }
        cb(resp);
      }
      // XXX: error handling!
    }
    req.send();
  }

  return {
    // get "session context" from the server
    context: function(args, cb) {
      args.method = 'get';
      args.path = '/v1/context';
      request(args, cb);
    }
  };
})();

if (typeof module != 'undefined' && module.exports) {
  module.exports = GombotClient;
}
