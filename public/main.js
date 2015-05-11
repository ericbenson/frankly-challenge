(function(){

  //find the gridsize from the URL
  var index = document.URL.lastIndexOf('#/'); 
  var gridSize = document.URL.slice(index+2);

  var client = new WebSocket('ws://localhost:8080/', 'grids');

  //build the table to be attached to the DOM. Adds classes to table cells, adds 'X' to appropriate cells, and attaches cell listeners
  var buildGrid = function(arr){
    //will store the coordinate of where the mousedown event takes place
    var coordinate; 
    var table = document.createElement('table');   

    for(var i=0; i<arr.length; i++){
      var row = document.createElement('tr');
      for(var j=0; j<arr[i].length; j++){
        var col = document.createElement('td');
        //adds classname to each element for easier reference
        col.className = '('+i+','+j+')'; 

        //add 'X' to appropriate cells
        if(arr[i][j] === 1){
          col.innerHTML = 'X';
        } 

        //IIFE to retain access to appropriate variables via closure
        (function(i,j,arr){
          //mousedown listener sets coordinate variable if clicked on an 'X' cell
          col.addEventListener('mousedown', function(){
            if(arr[i][j] === 1){
                coordinate = {x:i,y:j}; 
            }
          });
          //mouseup event sends updated grid array to server if it occurs on an empty cell and coordinate is set
          col.addEventListener('mouseup', function(){
            if(arr[i][j] !== 1 && coordinate){
                arr[coordinate.x][coordinate.y]=0; 
                arr[i][j]=1; 

                var data = {size: gridSize, update: true, grid: arr};
                client.send(JSON.stringify(data));
            }
            //reset coordinate
            coordinate = false; 
          });      

          //click event toggles 'X' on cells, sending all updates to the server
          col.addEventListener('click', function(){
            if(arr[i][j] === 1){
              arr[i][j]=0; 
              var data = {size: gridSize, update: true, grid: arr};
              client.send(JSON.stringify(data));
            } else {
              arr[i][j]=1; 
              var data = {size: gridSize, update: true, grid: arr};
              client.send(JSON.stringify(data));
            }
          })
        })(i,j,arr);
        row.appendChild(col);
      }
      table.appendChild(row);
    }
    return table; 
  };

  client.onerror = function(e) {
      document.getElementsByClassName('grid')[0].innerHTML = JSON.stringify(e);
      console.log('Connection Error');
  };

  client.onopen = function() {
      console.log('WebSocket Client Connected');

      var data = {size: gridSize, firstConnection: true};

      if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(data));
      }
  };

  client.onclose = function() {
      console.log('grid Client Closed');
  };

  //on receiving a message, rerender the grid
  client.onmessage = function(e) {
      if (typeof e.data === 'string') {
        var data = JSON.parse(e.data);
        var grid = document.getElementsByClassName('grid')[0];
        
        //if there is a grid already rendered
        if(data.update){
          grid.removeChild(grid.childNodes[1]);
        }
        grid.appendChild(buildGrid(data.grid));
      }
  };
})();