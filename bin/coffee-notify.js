#!/usr/bin/env node

var optimist = require('optimist')
  .usage('Usage: coffee-notify [options] path/to/script.coffee\n'+
    'Wrapper around coffee to send notifications on compile success/error.\n'+
    'Note: This automatically adds the -c coffee option.\n'+
    'In addition to the below options you can also pass some coffee options: -b, --bare, -w, --watch, -l, --lint') // TODO: complete this
  .describe('server', 'Set the host:port of a gntp server to send the notification to. Hint: common default port is 23053')
  .describe('appname', 'When using gntp you can set the application name used to register on the gntp host. Default: "coffee"')
  .describe('timeout', 'Amount in ms to show the notification. Default: 2000')
  .describe('error-multi', 'Multiplier for error message display time. Default: 3 (resulting in 6000ms for the default timeout)')
  .describe('help', 'Show this short help')
  .boolean('b', 'w', 'l')
  .alias({
    b: 'bare',
    w: 'watch',
    l: 'lint'
  })
  .demand(1)
  .check(function(args) {
    if (args.server && typeof(args.server) === "string" && ! args.server.match(/^.*:[\d]+$/) ) {
      throw new Error('Server argument has wrong format. Needs to be host:port.');
    }
    return true;
  })
  .alias('h', 'help')
  
if (optimist.argv.help === true) {
  optimist.showHelp();
  process.exit();
}

var gntp = false;

var gntp_args = [];

var argv = optimist.argv;



console.log('test', argv);
