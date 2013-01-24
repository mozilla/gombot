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
      client = new Client('http://' + servers.host + ':' + servers.port + '/api');
      client.context({}, function (err) {
        done();
      });
    });
  });
});

describe('/api/v1/account', function() {
  it('staging should return success', function(done) {
    client.account({
      email: 'foo@account.com',
      pass: 'bar',
      newsletter: false,
      payload: 'foo'
    }, function(err, r) {
      should.not.exist(err);
      should.exist(r);
      (r.success).should.be.true;
      should.exist(r.updated);
      done();
    });
  });
  it ('should get initial payload', function(done) {
    client.getPayload({ updated: 0 }, function(err, r) {
      should.not.exist(err);
      should.exist(r);
      should.exist(r.updated);
      (r.payload).should.equal('foo');
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
