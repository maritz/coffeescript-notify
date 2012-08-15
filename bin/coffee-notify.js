#!/usr/bin/env node

var optimist = require('optimist')
  .usage('Usage: coffee-notify [options] path/to/script.coffee\n'+
    'Wrapper around coffee to use coffeescript-notify or gntp.\n'+
    'Note: This automatically adds the -c coffee option.\n'+
    'In addition to the below options you can also pass some coffee options: -w, --watch, -b, --bare, -l, --lint, -o, --output') // TODO: complete this?
  .describe('gntp', 'Path to the gntp-send bin. Needs the server argument as well.')
  ["default"]('gntp', '/usr/bin/gntp-send')
  .describe('server', 'Set the host:port of a gntp server to send the notification to. Hint: common default port is 23053')
  .describe('password', 'Specify a password for the gntp server.')
  ["default"]('password', '')
  .describe('appname', 'When using gntp you can set the application name used to register on the gntp host. Default: "coffee"')
  ["default"]('appname', 'coffee')
  .describe('ignore-success', "Don't send success notifications.")
  .describe('help', 'Show this short help')
  .boolean('b', 'w', 'l', 'ignore-success')
  .alias({
    b: 'bare',
    w: 'watch',
    l: 'lint',
    o: 'output'
  })
  .demand(1)
  .check(function(args) {
    if (args.server && typeof(args.server) === "string" && ! args.server.match(/^.*:[\d]+$/) ) {
      throw new Error('Server argument has wrong format. Needs to be host:port.');
    }
    return true;
  })
  .alias('h', 'help');
  
if (optimist.argv.help === true) {
  optimist.showHelp();
  process.exit();
}

var cp = require('child_process');
var fs = require('fs');

var argv = optimist.argv;

var createCoffeeProcess = function (handlers) {
  var args;
  args = [];
  
  if ( ! argv.server) {
    args.push('-r', 'coffeescript-notify');
  }
  args.push('-c');
  if (argv.lint) {
    args.push('-l');
  }
  if (argv.watch) {
    args.push('-w');
  }
  if (argv.bare) {
    args.push('-b');
  }
  if (argv.output) {
    args.push('-o', argv.output);
  }
  args.push(argv._.join(' '));
  
  //console.log('spawning coffee:', args.join(' '));
  var coffee = cp.spawn('coffee', args);
  if (handlers) {
    if (handlers.data) {
      coffee.stdout.on('data', handlers.data);
    }
    if (handlers.err) {
      coffee.stderr.on('data', handlers.err);
    }
    if (handlers.exit) {
      coffee.on('exit', handlers.exit);
    }
  }
};

if (argv.server && argv.gntp) {
  
  var gntp_exists = fs.existsSync(argv.gntp);
  
  if ( ! gntp_exists) {
    console.error('The supplied gntp path does not exist:', argv.gntp);
    process.exit(1);
  }
  
  var icons = {
    success: __dirname+'/../i/coffee-success.png',
    failure: __dirname+'/../i/coffee-error.png'
  };
  
  var gntpSend = function (msg, icon) {
    var args = [];
    args.push(argv.gntp);
    args.push('-a', '"'+argv.appname+'"');
    args.push('-s', argv.server);
    args.push('-p', '"'+argv.password+'"');
    args.push('"Coffeescript Notify"'); // title
    args.push('"'+msg+'"');
    args.push(icon);
    //console.log('spawning', argv.gntp, args.join(' '));
    var gntp = cp.exec(args.join(' '));
    
    gntp.stdout.on('data', function (err) {
      console.log('GNTP Out:', err.toString());
    });
    gntp.stderr.on('data', function (err) {
      console.error('GNTP Error:', err.toString());
      process.exit(1);
    });
    gntp.on('exit', function (code) {
      if (code !== 0) {
        console.log('GNTP exited with: ', code);
      }
    });
  };
  
  var sendSuccess = function (msg) {
    if ( ! argv["ignore-success"] ) {
      gntpSend(msg, icons.success);
    }
  };
  
  var sendError = function (err) {
    gntpSend(err, icons.failure);
  };
  
  createCoffeeProcess({
    data: function (data) {
      data = data.toString();
      if (data.indexOf(' - compiled ') !== -1) {
        sendSuccess(data.substr(data.indexOf(' - ')+3));
      } else {
        sendError(data);
      }
    },
    err: function (err) {
      err = err.toString();
      if (err === 'path.exists is now called `fs.exists`.\n') {
        // coffee 1.3 still uses fs.exists, not our problem here
        return null;
      }
      
      if ( ! argv.watch) {
        sendError(err);
      } else {
        console.error('Error from coffee:', err);
      }
    },
    exit: function (code) {
      if ( ! argv.watch && code === 0) {
        sendSuccess('compiled '+argv._);
      } else {
        console.log('exiting', code);
      }
    }
  });
  
} else {
  createCoffeeProcess({
    data: function (data) {
      console.log(data.toString());
    },
    err: function (err) {
      err = err.toString();
      if (err !== 'path.exists is now called `fs.exists`.\n') {
        // coffee 1.3 still uses fs.exists, not our problem here
        console.log('Error:', err);
      }
    }
  });
}
