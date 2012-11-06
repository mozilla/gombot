var crypto = require('crypto'),
      Hapi = require('hapi')

module.exports = {
  method: 'GET',
  handler: handler,
  config: {
    auth: false
  }
};

function handler(request) {
  crypto.randomBytes(32, function(err, bytes) {
    if (err) return Hapi.Error.internal("error attaining entropy");
    request.reply({
      server_time: Math.round((new Date()).getTime() / 1000),
      entropy: bytes.toString('base64')
    });
  });
};
