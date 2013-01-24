
var config = module.exports = {
  public_url: process.env.PUBLIC_URL || 'https://gombot.org',
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
    docs: true,
    auth: {
      scheme: 'hawk',
      hostHeaderName: process.env.HOST_HEADER || 'X-Forwarded-Host'
    }
  },
  build_server: {
    enabled: process.env.ENABLE_BUILDS || false
  },
  env: process.env.NODE_ENV || 'development',
  db: {
    store: process.env.DB_STORE || 'json',
    hosts: [ 'localhost:8091' ],
    username: 'Administrator',
    password: process.env.DB_PASSWORD || 'password',
    bucket: process.env.DB_BUCKET || 'default'
  }
};

config.api_url = 'http://' + config.process.api.host + ':' + config.process.api.port;
config.static_url = 'http://' + config.process.static.host + ':' + config.process.static.port;
config.builder_url = 'http://' + config.process.builder.host + ':' + config.process.builder.port;
