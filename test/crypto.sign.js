const
should = require('should'),
GombotCrypto = require('../client/crypto.js');

describe('GumbotCrypto.sign', function() {
  it('should throw when required parameters are missing', function(done) {
    (function(){
      GombotCrypto.sign();
    }).should.throw('.key is required and must be a string');
    (function(){
      GombotCrypto.sign({ key: "foo" });
    }).should.throw('.email is required and must be a string');
    (function(){
      GombotCrypto.sign({ key: "foo", email: "bar" });
    }).should.throw('.date is required and must be a javascript Date object');
    (function(){
      GombotCrypto.sign({ key: "foo", email: "bar", date: new Date() });
    }).should.throw('.payload is required and must be a string');
    (function(){
      GombotCrypto.sign({ key: "foo", email: "bar", date: new Date(), payload: 'x' });
    }).should.throw('missing required callback argument');
    done();
  });

  it('should deterministically sign when arguments are correct', function(done) {
    GombotCrypto.derive({ email: 'foo', password: 'bar' }, function(err, rez) {
      should.not.exist(err);
      GombotCrypto.sign({
        key: rez.cryptKey,
        email: "bar",
        date: new Date(1352177818454),
        payload: 'x'
      }, function(err, rez) {
        should.not.exist(err);
        ("DqKJit053JFYNgueXwOZ1xKO83l2zjDUVctL9koj/G4=").should.equal(rez);
        done();
      });
    });
  });
});
