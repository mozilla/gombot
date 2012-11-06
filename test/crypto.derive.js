const
should = require('should'),
GombotCrypto = require('../client/crypto.js');

describe('GumbotCrypto.derive', function() {
  it('should fail when invoked without required params', function(done) {
    (function(){
      GombotCrypto.derive();
    }).should.throw('missing required parameters');
    done();
  });

  it('should fail when invoked without callback', function(done) {
    (function(){
      GombotCrypto.derive({ email: 'foo', password: 'bar'});
    }).should.throw('missing required callback parameter');
    done();
  });

  it('should produce expected derived keys when invoked correctly', function(done) {
    GombotCrypto.derive({ email: 'foo', password: 'bar' }, function(err, rez) {
      should.not.exist(err);
      should.exist(rez);
      (rez.authKey).should.equal('LmsKnYuun7gFgw7CfxBX3CHW7oylp6bpGzo950x8ZG0=');
      (rez.cryptKey).should.equal('I0aVNap4YYwJItXT409giaxMA4K313Q+iHerYBsgtu4=');
      done();
    });
  });
});
