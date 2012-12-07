
var config = module.exports = {
  public_url: process.env.PUBLIC_URL || 'http://127.0.0.1:20000',
  process: {
    router: {
      port: process.env.PORT || 20000,
      host: '127.0.0.1'
    },
    api: {
      port: 20001,
      host: '127.0.0.1'
    },
    static: {
      port: 20002,
      host: '127.0.0.1'
    },
    builder: {
      port: 20003,
      host: '127.0.0.1'
    }
  },
  hapi: {
    name: "Gombot API Server",
    docs: {
      auth: {
        mode: 'none'
      }
    },
    auth: {
      scheme: 'hawk'
    }
  },
  db: {
    hosts: [ 'localhost:8091' ],
    username: 'Administration',
    password: process.env.DB_PASSWORD || null,
    bucket: process.env.DB_BUCKET || 'default'
  }
};

config.api_url = 'http://' + config.process.api.host + ':' + config.process.api.port;
config.static_url = 'http://' + config.process.static.host + ':' + config.process.static.port;
config.builder_url = 'http://' + config.process.builder.host + ':' + config.process.builder.port;
