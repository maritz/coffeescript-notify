cp = require('child_process')
CoffeeScript = require "coffee-script"

App = {}

App.notify = (title, message, type) ->
  args = []
  timeout = if type == "success" then 1000 else 4000
  args.push '-t', timeout
  args.push '-i', "#{__dirname}/i/coffee-#{type}.png"
  args.push "#{title}", "#{message}"
  cp.spawn 'notify-send', args

CoffeeScript.on 'failure', (error, task) ->
  App.notify 'Coffee-Script faild:',"#{error}","error" 
  
CoffeeScript.on 'success', (task) ->
  App.notify 'Coffee-Script compiled:', "#{task.file} sucessfully compiled!","success"
