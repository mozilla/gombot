var Hapi   = require('hapi');
var db     = require('../../db.js');

var B = Hapi.Types.Boolean;
var S = Hapi.Types.String;

module.exports = {
  method: 'POST',
  handler: handler,
  config: {
    auth: {
      mode: 'none'
    },
    description: 'Stage a new account',
    validate: {
      schema: {
        email: S().email().required(),
        pass: S().required(),
        newsletter: B()
      }
    }
  }
};

function handler(request) {
  db.stageAccount(request.payload, function(err) {
    if (err) return request.reply(Hapi.Error.badRequest("Could not create account: " + err));
    request.reply({
      success: true
    });
  });
}
