const
should = require('should'),
runner = require('./lib/runner.js'),
Client = require('../client/client.js');

var servers;
var client;

describe('the servers', function() {
  it('should start up', function(done) {
    runner(function(err, r) {
      should.not.exist(err);
      should.exist(r);
      servers = r;
      client = new Client('http://' + servers.host + ':' + servers.port);
      done();
    });
  });
});

describe("/api/v1/context", function() {
  it ("should return an object with two keys", function(done) {
    client.context(function(err, r) {
      should.not.exist(err);
      should.exist(r);
      should.exist(r.session_context);
      (r.server_time).should.be.a('number');
      (r.entropy).should.be.a('string');
      done();
    });
  });
});

describe('the servers', function() {
  it('should stop', function(done) {
    servers.stop(function(err) {
      should.not.exist(err);
      done();
    });
  });
});
