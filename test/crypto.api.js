const
should = require('should'),
GombotCrypto = require('../client/crypto.js');

describe('the client crypto library', function() {
  it('should export a couple functions', function(done) {
    should.exist(GombotCrypto.seed);
    should.exist(GombotCrypto.decrypt);
    should.exist(GombotCrypto.encrypt);
    should.exist(GombotCrypto.derive);
    should.exist(GombotCrypto.sign);
    done();
  });
});
