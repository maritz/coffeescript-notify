sys = require('sys')
exec = require('child_process').exec
CoffeeScript = require "coffee-script"

App = {}

App.puts = (error, stdout, stderr) ->
  #sys.puts(stdout)
  return

App.icon = "#{__dirname}/i/coffee.png"

App.notify = (title, message, type) ->

	exec "notify-send  -i '#{__dirname}/i/coffee-#{type}.png' '#{title}' '#{message}'",App.puts 
  # Go silent
	# console.log "#{message}"
	

CoffeeScript.on 'failure', (error, task) ->
  App.notify 'Coffee-Script faild:',"#{error}","error" 
  
CoffeeScript.on 'success', (task) ->
  App.notify 'Coffee-Script compiled:', "#{task.file} sucessfully compiled!","success"
