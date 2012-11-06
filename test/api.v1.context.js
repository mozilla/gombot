const
should = require('should'),
runner = require('./lib/runner.js');

var servers;

describe('the servers', function() {
  it('should start up', function(done) {
    runner(function(err, r) {
      should.not.exist(err);
      should.exist(r);
      servers = r;
      done();
    });
  });
});
