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
      (rez.authKey).should.equal('56c1b9bbc2bd675dd1a7ee67f1f5ad425a15f5e4898879981fedf0010b968452');
      (rez.aesKey).should.equal('4940455f814509ddc808c85489dc31069e6d4e63be67c948b9e9272e3f742fda');
      (rez.hmacKey).should.equal('e949ab6e3ddeaa91ebe5138f89eccabd40eb08161df77d1679392085b5e95dd3');
      done();
    });
  });
});
