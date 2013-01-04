var Hapi   = require('hapi');
var db     = require('../../db.js');

var B = Hapi.Types.Boolean;
var S = Hapi.Types.String;
var N = Hapi.Types.Number;

module.exports = [
  {
    method: 'PUT',
    handler: put,
    auth: {
      mode: 'hawk'
    },
    config: {
      description: 'Store user credentials',
      validate: {
        schema: {
          payload: S().required()
        }
      }
    }
  },
  {
    method: 'GET',
    handler: get,
    auth: {
      mode: 'hawk'
    },
    config: {
      description: 'Retreive user credentials',
      response: {
        success: B(),
        payload: S().required(),
        updated: N().required()
      }
    }
  }
];

function put(request) {
  var id = request.session.id;
  var payload = request.payload.payload;
  console.log('storing payload', payload);
  db.storePayload(id, payload, function(err) {
    if (err) return request.reply(Hapi.Error.internal("Could not store payload: " + err));
    request.reply({
      success: true
    });
  });
}

function get(request) {
  var id = request.session.id;
  db.getPayload(id, function(err, doc) {
    if (err) return request.reply(Hapi.Error.internal("Could not retreive payload: " + err));
    request.reply({
      success: true,
      payload: doc.payload,
      updated: doc.timestamp
    });
  });
}
