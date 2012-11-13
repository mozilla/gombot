
// set up views for static site
function setup(app) {
  app.get('/', function(req, res) {
    res.render('index.html');
  });
}

exports.setup = setup;
