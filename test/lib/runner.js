// run servers for local testing

var spawn = require('child_process').spawn,
     path = require('path');

module.exports = function(cb) {
  var s = {
    started: false,
    shuttingDown: false
  };
  // spawn servers
  s.server = spawn(path.join(__dirname, '..', '..', 'bin', 'api'), [], {
    env: {
      PORT: 0,
      PATH: process.env.PATH
    }
  });
  s.server.stdout.on('data', function (data) {
    if (!s.started) {
      // we parse app output to determine when the process has really
      data.toString().split("\n").forEach(function(line) {
        var m = /running on http:\/\/([a-zA-Z0-9_.]+):([0-9]+)$/.exec(line);
        if (m) {
          s.started = true;
          s.host = m[1];
          s.port = parseInt(m[2], 10);
          cb(null, s);
        }
      });
    }
    if (process.env.LOG_TO_CONSOLE) {
      process.stdout.write(data);
    }
  });

  s.server.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  s.server.on('exit', function (code) {
    var err = 'server exited unexpectedly with ' + code;
    if (s.stopper) {
      s.stopper(!code ? null : err);
    } else if (!s.shuttingDown && s.started) {
      process.stderr.write(err + "\n");
      process.exit(1);
    } else if (!s.started) {
      cb(err);
    }
  });

  s.stop = function(cb) {
    s.shuttingDown = true;
    s.server.kill();
    s.stopper = cb;
  }

  process.on('exit', function() {
    s.server.kill();
  });
};
