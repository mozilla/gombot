var crypto = require('crypto'),
      Hapi = require('hapi'),
        db = require('../../db');

var B = Hapi.Types.Boolean,
    S = Hapi.Types.String;

module.exports = {
  method: 'PUT',
  handler: handler,
  config: {
    auth: false,
    description: 'Stage a new account',
    schema: {
      email: B(),
      pass: S()
    },
    response: {
      success: B()
    }
  }
};

function handler(request) {
  console.log('$$$$$$$$$$');
  db.stageAccount(request.payload, function(err) {
    if (err) request.reply(Hapi.Error.internal("error staging account"));
    request.reply({
      success: true
    });
  });
}
