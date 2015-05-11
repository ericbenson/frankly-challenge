var count = 0;  

//{size: {grid: [[]], connections:{id: connection}}};
var grids = {};

module.exports = {
  //if no grid exists for a given size, create the grid and store it in the grids object
  createGrid : function(size){
    if(!grids[size]){
      var grid = [];
      var row;  
      for(var i=0; i<size; i++){
        row = [];
        for(var j=0; j<size; j++){
          row.push(0);
        }
        grid.push(row);
      }
      grids[size] = {grid: grid};
    }  
    return grids[size].grid;
  }, 

  //store the passed in connection in the grids object based on the size of the grid. Connection stored with unique count ID
  storeConnection : function(size, connection){
    if(!grids[size].connections){
      grids[size].connections = {};
    }
    grids[size].connections[count++] = connection; 
  },

  //send the updated grid to all connected clients of the same grid size. If connection no longer connected, delete connection
  sendToAllConnections : function(data){
    var size = data.size; 
    for(var id in grids[size].connections){
      var connection = grids[size].connections[id];
      if(connection.connected){
        connection.sendUTF(JSON.stringify(data));  
      } else {
        delete connection;
      }
    }
  },

  getGrid : function(size){
    return grids[size].grid;    
  },

  setGrid : function(size, newGrid){
    grids[size].grid = newGrid;
  } 

}