GombotClient = (function() {
  var xhr = typeof jQuery !== 'undefined' ? jQuery.ajax : require('xhrequest');

  function request(args, cb) {
    var url = args.scheme ? args.scheme : 'http';
    var method = args.method.toUpperCase();
    url += "://" + args.host;
    if (args.port) url += ":" + args.port;
    url += args.path;

    console.log('sending xhr');
    xhr(url, {
      method: method,
      success: function (data, res, status) {
        try {
          var body = JSON.parse(data);
          body.session_context = {};
          cb(null, body);
        } catch (e) {
          cb('Invalid JSON response: '+e);
        }
      },
      error: function (data, res, status) {
        cb('Error: '+data+'\nStatus: '+status);
      },
      complete: function () {
        cb('huh');
      }
    });
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
