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
    }).should.throw('.date is required and must be a javascript Date object or an integer representing seconds since epoch');
    (function(){
      GombotCrypto.sign({
        key: "foo",
        email: "bar",
        date: new Date(),
        payload: 45 // bogus!
      });
    }).should.throw('.payload must be a string if supplied');
    (function(){
      GombotCrypto.sign({
        key: "foo",
        email: "bar",
        date: new Date(),
        payload: 'x' });
    }).should.throw('.url is required and must be a string');
    (function(){
      GombotCrypto.sign({
        key: "foo",
        email: "bar",
        date: new Date(),
        payload: 'x',
        url: "https://api.gombot.org/v1/foo"
      });
    }).should.throw('.method must be an allowable HTTP method');
    (function(){
      GombotCrypto.sign({
        key: "foo",
        email: "bar",
        date: new Date(),
        payload: 'x',
        url: "https://api.gombot.org/v1/foo",
        method: 'get'
      });
    }).should.throw('.nonce should be a random string');
    (function(){
      GombotCrypto.sign({
        key: "foo",
        email: "bar",
        date: new Date(),
        payload: 'x',
        url: "https://api.gombot.org/v1/foo",
        method: 'get',
        nonce: "one time only please"
      });
    }).should.throw('missing required callback argument');
    done();
  });

  it('should deterministically sign with constant arguments', function(done) {
    GombotCrypto.derive({ email: 'foo', password: 'bar' }, function(err, rez) {
      should.not.exist(err);
      GombotCrypto.sign({
        key: rez.cryptKey,
        email: "bar",
        date: new Date(1352177818454),
        payload: 'x',
        url: "https://api.gombot.org:10/v1/foo",
        method: 'get',
        nonce: "one time only please"
      }, function(err, rez) {
        should.not.exist(err);
        ("Zt21WXS7nkwIUdocxbzMBsXKv+0NREsxQ7aBHA9MS4w=").should.equal(rez);
        done();
      });
    });
  });
});
