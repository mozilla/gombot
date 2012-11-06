// run servers for local testing

var spawn = require('child_process').spawn,


module.exports = function(cb) {
  var s = {};
  // spawn servers
  s.api_server = spawn(path.join(__dirname, '..', 'bin', 'api'));
  s.api_server.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  s.api_server.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  s.api_server.on('exit', function (code) {
    console.log('child process exited with code ' + code);
  });

  process.nextTick(function() {
    cb(null, s);
  });
};
