// app.js -- javascript for the application
// inspired by creeper world evermore and 
// http://www.playfuljs.com/realistic-terrain-in-130-lines/


var app = {
  numColours: 6,
  levelColours: [],
  blockSize: 20,
  map: [[]],
  size: 1
};

app.init = function() {
  this.initLevelColours();
  //this.initLandscape();
  this.map = this.genMap(5);
  this.size = this.map.length;

  app.clearBackground();
  app.drawMap();
};

app.initLevelColours = function() {
  this.levelColours = new Array(this.numColours);
  for (var i = 0; i < this.numColours; i++) {
    this.levelColours[i] = ~~((i / this.numColours) * 100) + 75
  }
}


app.genMap = function(_multiplier) {
  // size should always be a power of 2 plus 1, 16 = 2^4
  var multiplier = _multiplier;
  var size = Math.pow(2, multiplier) + 1;
  var map = new Array(size);
  for (var i = 0; i < size; i++) {
    map[i] = new Array(size);
  }

  var maxHeight = 100;
  // set the corner values to random values
  map[0][size-1] = ~~(Math.random() * maxHeight);
  map[size-1][0] = ~~(Math.random() * maxHeight);
  map[size-1][size-1] = ~~(Math.random() * maxHeight);
  map[0][0] = ~~(Math.random() * maxHeight);

  var printMap = function(map, size) {
    for (var y = 0; y < size; y++) {
      var line = y + ': |';
      for (var x = 0; x < size; x++) {
        var val = (map[x][y] == undefined ? '' : map[x][y].toString());
        if (val.length < 3) {
          val = new Array(3 - val.length).join(' ') + val;
        }
        line += val + '|';
      }
      console.log(line);
    }
  };

  var calcMiddleHeight = function(xOffset, yOffset, map, size) {
    var half = ~~(size / 2);
    var sum = (
        map[xOffset][yOffset+size-1] +
        map[xOffset+size-1][yOffset] +
        map[xOffset+size-1][yOffset+size-1] +
        map[xOffset][yOffset]
      );
    var middle = ~~(sum / 4);
    map[xOffset+half][yOffset+half] = middle;
  };

  var calcSideHeights = function(xOffset, yOffset, map, size) {
    // values needed or calculations
    var half = ~~(size / 2);
    var nw = map[xOffset][yOffset];
    var ne = map[xOffset+size-1][yOffset];
    var sw = map[xOffset][yOffset+size-1];
    var se = map[xOffset+size-1][yOffset+size-1];
    var center = map[xOffset+half][yOffset+half];

    // calculated values based on averaging
    var n = ~~((nw + ne + center)/3);
    var e = ~~((se + ne + center)/3);
    var w = ~~((nw + sw + center)/3);
    var s = ~~((sw + se + center)/3);

    // assign values
    map[xOffset+half][yOffset] = n;
    map[xOffset+size-1][yOffset+half] = e;
    map[xOffset][yOffset+half] = w;
    map[xOffset+half][yOffset+size-1] = s;
  }

  function populateMap(map, mapSize) {
    var iteration = 0;
    for (var multiplier = _multiplier; multiplier > 0; multiplier--, iteration++) {
      var size = Math.pow(2, multiplier) + 1;
      var half = (size - 1) / 2;
      var divisions = Math.pow(2, iteration);
      for (var xDivision = 0; xDivision < divisions; xDivision++) {
        for (var yDivision = 0; yDivision < divisions; yDivision++) {        
          calcMiddleHeight(xDivision * (size-1), yDivision * (size-1), map, size);      
          calcSideHeights(xDivision * (size-1), yDivision * (size-1), map, size);
        }
      }
    }
  }
  populateMap(map, size);

  // find min and max
  var min = 99, max = 0;
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var currValue = map[x][y];
      if (currValue < min) {
        min = currValue;
      }
      if (currValue > max) {
        max = currValue;
      }
    }
  }

  // generate a new map based on limits
  var numLevels = this.numColours-1;
  var levelRange = (max - min) / numLevels;
  // initialize normalized map
  var normalizedMap = new Array(size);
  for (var i = 0; i < size; i++) {
    normalizedMap[i] = new Array(size);
  }

  // Populate the normalized map
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      normalizedMap[x][y] = ~~((map[x][y]-min) / levelRange);
    }
  }  

  return normalizedMap;
}


app.drawMap = function() {
  if (!this._ctx) {
    return;
  }

  // draw blocks
  for (var y = 0; y < this.size; y++) {
    for (var x = 0; x < this.size; x++) {
      var col = this.levelColours[this.map[x][y] || 0];
      var colour = 'rgb('+col+', '+col+', '+col+')';
      this._ctx.fillStyle = colour;
      this._ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
    }
  }

  // draw east edges
  for (var y = 0; y < this.size; y++) {
    for (var x = 0; x < this.size-1; x++) {
      var currHeight = this.map[x][y];
      var nextHeight = this.map[x+1][y];
      if (currHeight > nextHeight) {
        // draw a thick line
        this._ctx.lineWidth = 3;
        this._ctx.strokeStyle = 'black;';
        this._ctx.beginPath();
        this._ctx.moveTo((x+1) * this.blockSize, y * this.blockSize);
        this._ctx.lineTo((x+1) * this.blockSize, (y+1) * this.blockSize);
        this._ctx.stroke();
      }
    }
  }

  // draw south edges
  for (var y = 0; y < this.size-1; y++) {
    for (var x = 0; x < this.size; x++) {
      var currHeight = this.map[x][y];
      var nextHeight = this.map[x][y+1];
      if (currHeight > nextHeight) {
        // draw a thick line
        this._ctx.lineWidth = 3;
        this._ctx.strokeStyle = 'black;';
        this._ctx.beginPath();
        this._ctx.moveTo(x * this.blockSize, (y+1) * this.blockSize);
        this._ctx.lineTo((x+1) * this.blockSize, (y+1) * this.blockSize);
        this._ctx.stroke();
      }
    }
  }
  
  // draw north edges
  for (var y = 1; y < this.size; y++) {
    for (var x = 0; x < this.size; x++) {
      var currHeight = this.map[x][y-1];
      var nextHeight = this.map[x][y];
      if (currHeight < nextHeight) {
        // draw a thick line
        this._ctx.lineWidth = 1;
        this._ctx.strokeStyle = 'black';
        this._ctx.beginPath();
        this._ctx.moveTo(x * this.blockSize, y * this.blockSize);
        this._ctx.lineTo((x+1) * this.blockSize, y * this.blockSize);
        this._ctx.stroke();
      }
    }
  }
  
  // draw west edges
  for (var y = 0; y < this.size; y++) {
    for (var x = 1; x < this.size; x++) {
      var currHeight = this.map[x-1][y];
      var nextHeight = this.map[x][y];
      if (currHeight < nextHeight) {
        // draw a thick line
        this._ctx.lineWidth = 1;
        this._ctx.strokeStyle = 'black;';
        this._ctx.beginPath();
        this._ctx.moveTo(x * this.blockSize, y * this.blockSize);
        this._ctx.lineTo(x * this.blockSize, (y+1) * this.blockSize);
        this._ctx.stroke();
      }
    }
  }
  
};

app.clearBackground = function() {
  if (!this._ctx) {
    return;
  }

  this._ctx.fillStyle = 'black';
  this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
};

window.onload = function() {
  app._canvas = document.getElementById('canvas');
  app._canvas.width = window.innerWidth;
  app._canvas.height = window.innerHeight;
  app._ctx = canvas.getContext('2d');

  app.init();
};