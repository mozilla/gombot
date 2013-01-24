var Hapi   = require('hapi');

var B = Hapi.Types.Boolean;

module.exports = {
  method: 'GET',
  handler: handler,
  auth: {
    mode: 'hawk'
  },
  config: {
    description: 'Check authorization status',
    response: {
      schema: {
        success: B()
      }
    }
  }
};

function handler(request) {
  request.reply({
    success: true
  });
}
