var Hapi   = require('hapi');
var db     = require('../../../db.js');

var B = Hapi.Types.Boolean;
var S = Hapi.Types.String;
var N = Hapi.Types.Number;

module.exports = {
  method: 'GET',
  handler: handler,
  auth: {
    mode: 'hawk'
  },
  config: {
    description: 'Retreive last update time of user credentials',
    response: {
      schema: {
        success: B(),
        updated: N().required()
      }
    }
  }
};

function handler(request) {
  var id = request.session.id;
  db.getPayload(id, function(err, doc) {
    if (err) return request.reply(Hapi.Error.internal("Could not retreive payload update time: " + err));
    request.reply({
      success: true,
      updated: doc.timestamp
    });
  });
}
