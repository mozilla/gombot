var walk = require('walkdir'),
    path = require('path');

const API_BASE_PATH = path.join(__dirname, 'api');
const ROUTE_BASE_PATH = __dirname;

function addRouteFromFile(hapiServer, apiPath) {
  // hack off ext
  var route = apiPath.substr(0, apiPath.length - 3);
  var route = path.relative(ROUTE_BASE_PATH, route);
  var impls = require(apiPath);
  if (Array.isArray(impls)) {
    impls.forEach(function (impl) {
      impl.path = '/' + route;
      console.log('route:', impl.method, impl.path);
      hapiServer.addRoute(impl);
    });
  } else {
    impls.path = '/' + route;
    console.log('route:', impls.method, impls.path);
    hapiServer.addRoute(impls);
  }
}

module.exports = function(hapiServer, cb) {
  // build up routes from the 'api/' directory
  var walker = walk(API_BASE_PATH);

  walker.on('file', function(apiPath, stat) {
    // if this is not a javascript file, skip it
    if (!/^[a-z\.]*\.js$/.test(path.basename(apiPath)))
      return;

    try {
      addRouteFromFile(hapiServer, apiPath);
    } catch (e) {
      walker.end();
      cb('error while loading API handler ("' + apiPath + '") ' +
         e.toString());
    }
  });

  walker.on('end', function() {
    cb(null);
  });
};
