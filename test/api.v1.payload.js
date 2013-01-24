const
should = require('should'),
runner = require('./lib/runner.js'),
Client = require('../client/client.js');

var servers;
var client;

var test_user = 'foo@payload.com';
var test_pass  = 'bar';

var updated;

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

function createAccount(email, pass, cb) {
  console.error('creating account');
  client.account({
    email: email,
    pass: pass
  }, function(err, r) {
    if (err) cb(err);
    cb(null);
  });
}

describe("/api/v1/payload", function() {
  it ('should create account', function(done) {
    createAccount(test_user, test_pass, done);
  });
  it ('should fail if missing payload', function(done) {
    try {
      client.storeEncryptedPayload({}, function(err, r) {
        should.exist(err);
        should.not.exist(r);
        should.exist(err.error);
        (err.error.errorCode).should.equal(400);
        return done();
      });
    } catch (e) {
      return done(e);
    }
  });
  it ('should store payload', function(done) {
    try {
      client.storePayload({
        payload: 'foo'
      }, function(err, r) {
        should.not.exist(err);
        should.exist(r);
        should.exist(r.updated);
        return done();
      });
    } catch (e) {
      return done(e);
    }
  });
  it ('should get payload', function(done) {
    client.getPayload({}, function(err, r) {
      should.not.exist(err);
      should.exist(r);
      should.exist(r.updated);
      (r.payload).should.equal('foo');
      updated = r.updated;
      done();
    });
  });
  it ('should not get payload if in sync', function(done) {
    client.getPayload({ updated: updated }, function(err, r) {
      should.not.exist(err);
      should.exist(r);
      should.exist(r.sync);
      (r.sync).should.equal(false);
      should.not.exist(r.payload);
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
