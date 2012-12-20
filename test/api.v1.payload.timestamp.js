const
should = require('should'),
runner = require('./lib/runner.js'),
Client = require('../client/client.js');

var servers;
var client;

var test_user = 'foo@payload.com';
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

describe("/api/v1/payload/timestamp", function() {
  it ('should store payload', function(done) {
    createAccount(test_user, test_pass, function() {
      try {
        client.storePayload({
          payload: 'foo'
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
  it ('should get payload timestamp', function(done) {
    try {
      client.getTimestamp({}, function(err, r) {
        should.not.exist(err);
        should.exist(r);
        should.exist(r.updated);
        done();
      });
    } catch (e) {
      done(e);
    }
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
