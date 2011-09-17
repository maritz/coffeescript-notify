var App, CoffeeScript, exec, sys;
sys = require('sys');
exec = require('child_process').exec;
CoffeeScript = require("coffee-script");
App = {};
App.puts = function(error, stdout, stderr) {};
App.notify = function(title, message, type) {
  return exec("notify-send  -i '" + __dirname + "/i/coffee-" + type + ".png' '" + title + "' '" + message + "'", App.puts);
};
CoffeeScript.on('failure', function(error, task) {
  return App.notify('Coffee-Script faild:', "" + error, "error");
});
CoffeeScript.on('success', function(task) {
  return App.notify('Coffee-Script compiled:', "" + task.file + " sucessfully compiled!", "success");
});