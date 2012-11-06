GombotClient = (function() {
  if (!xhr) var xhr = require('xmlhttprequest');

  function request(args, cb) {

  };

  return {
    // get "session context" from the server
    context: function(args, cb) {
      request(args, cb);
    }
  };
})();

if (typeof module != 'undefined' && module.exports) {
  module.exports = GombotClient;
}
