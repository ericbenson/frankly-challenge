var WebSocketServer = require('websocket').server;
var helpers = require('./helpers.js');

module.exports = function(server){
  
  wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
  });
   
  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed. 
    console.log(origin);
    if(origin = 'http://localhost:8080'){
      return true;
    }
    return false; 
  };


  wsServer.on('request', function(request) {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin 
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
      }
      
      var connection = request.accept('grids', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      connection.on('message', function(message) {
          if (message.type === 'utf8') {
            //data = {size: int, grid: [][], update:boolean, firstConnection:boolean}
            var data = JSON.parse(message.utf8Data);
            var size = data.size; 

            //if updating state for all connections
            if(data.update){
              //set internal state
              helpers.setGrid(size, data.grid);
              //send new state to all connections
              helpers.sendToAllConnections(data); 
            } 
            //else if first connection and needs initial state
            else if(data.firstConnection){
              data.firstConnection = false; 
              //create new grid if no internal grid exists
              helpers.createGrid(size, connection);
              //store the connection to send future state updates to
              helpers.storeConnection(size, connection);
              //set data.grid to the internal grid state
              data.grid = helpers.getGrid(size);
              //send back internal grid state with corresponding data
              connection.sendUTF(JSON.stringify(data));
            }
          }
      });
      connection.on('close', function(reasonCode, description) {
          console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      });
  });

};