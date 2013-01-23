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
      description: 'Returns user credentials if the client\'s are outdated.',
      validate: {
        query: {
          updated: N().required()
        }
      },
      response: {
        schema: {
          success: B().required(),
          payload: S().required().allow(null),
          updated: N().required(),
          sync: B().required()
        }
      }
    }
  }
];

function put(request) {
  var id = request.session.id;
  var payload = request.payload.payload;

  db.storePayload(id, payload, function(err, timestamp) {
    if (err) return request.reply(Hapi.Error.internal("Could not store payload: " + err));
    request.reply({
      success: true,
      updated: timestamp
    });
  });
}

function get(request) {
  var id = request.session.id;
  var ts = request.query.updated;
  db.getPayload(id, function(err, doc) {
    if (err) return request.reply(Hapi.Error.internal("Could not retreive payload: " + err));
    var sync = doc.timestamp > ts;
    request.reply({
      success: true,
      payload: (sync ? doc.payload : null),
      updated: doc.timestamp,
      sync: sync
    });
  });
}
