const
should = require('should'),
runner = require('./lib/runner.js'),
Client = require('../client/client.js');

var servers;
var client;

var test_user = 'foo';
var test_pass  = 'bar';

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

function createAccount(email, pass, cb) {
  client.account({
    email: email,
    pass: pass
  }, function(err, r) {
    if (err) cb(err);
    cb(null, client.key);
  });
}

describe("/api/v1/status", function() {
  it ('should pass authorization', function(done) {
    createAccount(test_user, test_pass, function() {
      try {
        client.status({
          email: test_user,
          key: client.authKey,
          nonce: 'oh hai',
          date: new Date()
        }, function(err, r) {
          should.not.exist(err);
          should.exist(r);
          done();
        });
      } catch (e) {
        done(e);
      }
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
