var crypto = require('crypto'),
      Hapi = require('hapi');

var N = Hapi.Types.Number,
    S = Hapi.Types.String;

module.exports = {
  method: 'GET',
  handler: handler,
  config: {
    auth: {
      mode: 'none'
    },
    description: 'Get "context" for subsequent operations',
    response: {
      server_time: N(),
      entropy: S()
    }
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
