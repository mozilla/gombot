const
should = require('should'),
GombotCrypto = require('../client/crypto.js');

var seed = Buffer(require("crypto").randomBytes(32), "binary").toString('base64');
GombotCrypto.seed(seed, function () {});

describe('GumbotCrypto.sign', function() {
  it('should throw when required parameters are missing', function(done) {
    (function(){
      GombotCrypto.sign();
    }).should.throw('.keys.authKey is required and must be a string');
    (function(){
      GombotCrypto.sign({ keys: {authKey: "foo"} });
    }).should.throw('.email is required and must be a string');
    (function(){
      GombotCrypto.sign({ keys: {authKey: "foo"}, email: "bar" });
    }).should.throw('.date is required and must be a javascript Date object or an integer representing seconds since epoch');
    (function(){
      GombotCrypto.sign({
        keys: {authKey: "foo"},
        email: "bar",
        date: new Date(),
        payload: 45 // bogus!
      });
    }).should.throw('.payload must be a string if supplied');
    (function(){
      GombotCrypto.sign({
        keys: {authKey: "foo"},
        email: "bar",
        date: new Date(),
        payload: 'x' });
    }).should.throw('.url is required and must be a string');
    (function(){
      GombotCrypto.sign({
        keys: {authKey: "foo"},
        email: "bar",
        date: new Date(),
        payload: 'x',
        url: "https://api.gombot.org/v1/foo"
      });
    }).should.throw('.method must be an allowable HTTP method');
    (function(){
      GombotCrypto.sign({
        keys: {authKey: "foo"},
        email: "bar",
        date: new Date(),
        payload: 'x',
        url: "https://api.gombot.org/v1/foo",
        method: 'get'
      });
    }).should.throw('.nonce should be a random string');
    (function(){
      GombotCrypto.sign({
        keys: {authKey: "foo"},
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
    this.timeout(10000);
    GombotCrypto.derive({ email: 'foo', password: 'bar' }, function(err, rez) {
      should.not.exist(err);
      GombotCrypto.sign({
        keys: {authKey: rez.authKey },
        email: "bar",
        date: new Date(1352177818454),
        payload: 'x',
        url: "https://api.gombot.org:10/v1/foo",
        method: 'get',
        nonce: "one time only please"
      }, function(err, rez) {
        should.not.exist(err);
        should.exist(rez);
        (rez.Authorization).should.be.a('string');
        (rez.Authorization).should.equal('Hawk id="bar", ts="1352177818", nonce="one time only please", hash="2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881", mac="hXcx942Qj1tazZiKlw8VZ+fa0jUl4wFavD6dBPNLQvc="');
        done();
      });
    });
  });
});
