#!/usr/bin/env node
var http = require('http');
var Router = require('node-simple-router');
var router = Router(); 
 
var server = http.createServer(router);
var socket = require('./socket/connection.js')(server);
var port = process.env.PORT || 8080; 

server.listen(port, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
});


