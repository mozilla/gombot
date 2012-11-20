const fs   = require('fs');
const path = require('path');

// set up views for static site
function setup(app) {
  app.get('/', function(req, res) {
    res.render('index.html');
  });

  app.get('/downloads/latest', function(req, res) {
    fs.readFile(path.resolve(__dirname, '..', 'downloads', 'ver.txt'),
      function(err, sha) {
        if (err) console.log(err);
        res.redirect('/downloads/gombot-' + sha + '.crx');
      });
  });
}

exports.setup = setup;
