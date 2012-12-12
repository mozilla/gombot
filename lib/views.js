const fs   = require('fs');
const path = require('path');
const db   = require('./db');

// generated from public key during packaging
var appid = 'gbmmgmjoeplelogofbnjpmkmpodpfaif';

// set up views for static site
function setup(app) {
  app.get('/', function(req, res) {
    res.render('index.html');
  });

  app.post('/account', function(req, res) {
    res.redirect('/success');
  });

  app.get('/success', function(req, res) {
    res.render('created.html');
  });

  app.post('/join_alpha', function(req, res) {
    if (req.body.email) {
      db.storeAlphaEmail(req.body.email, function(err) {
        res.render('joined.html');
      });
    } else {
      res.redirect('/');
    }
  });

  app.get('/download', function(req, res) {
    res.locals({
      logo: 'chrome-logo.png',
      agent: 'Chrome'
    });
    res.render('download.html');
  });

  app.get('/downloads/latest', function(req, res) {
    latest(function(err, sha) {
        if (err) console.log(err);
        res.redirect('/downloads/gombot-' + sha + '.crx');
      });
  });

  app.get('/downloads/updates.xml', function(req, res) {
    latest(function(err, sha, ver) {
        if (err) console.log(err);
        res.locals({
          sha: sha,
          version: ver,
          appid: appid
        });
        res.render('updates.xml');
      });
  });
}

function latest(cb) {
  fs.readFile(path.resolve(__dirname, '..', 'downloads', 'ver.txt'), 'utf8', function (err, shaVer) {
    if (shaVer) {
      var split = shaVer.split(' ');
      cb(null, split[0], split[1]);
    }
  });
}

exports.setup = setup;
