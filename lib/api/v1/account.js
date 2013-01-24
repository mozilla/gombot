var Hapi   = require('hapi');
var db     = require('../../db.js');

var B = Hapi.Types.Boolean;
var S = Hapi.Types.String;
var N = Hapi.Types.Number;

module.exports = {
  method: 'POST',
  handler: handler,
  config: {
    auth: {
      mode: 'none'
    },
    description: 'Stage a new account with an initial payload',
    validate: {
      schema: {
        email: S().email().required(),
        pass: S().required(),
        newsletter: B(),
        payload: S().required()
      }
    },
    response: {
      schema: {
        success: B().required(),
        updated: N().required()
      }
    }
  }
};

function handler(request) {
  db.stageAccount(request.payload, function(err) {
    if (err) return request.reply(Hapi.Error.badRequest("Could not create account: " + err));
    db.storePayload(request.payload.email, request.payload.payload, function(err, updated) {
      if (err) return request.reply(Hapi.Error.badRequest("Could not seed initial data: " + err));
      request.reply({
        success: true,
        updated: updated
      });
    });
  });
}
