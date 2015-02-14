var BEVEL  = 5;
var WIDTH  = 10;
var HEIGHT = 20;
var SIZE   = ~~(window.innerHeight / HEIGHT * 0.9);

var putPixel = function(context, size, x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * size, y * size, size, size);

  context.beginPath();
  context.fillStyle = 'rgba(0,0,0,0.25)';
  context.moveTo(x * size, y * size);
  context.lineTo(x * size + BEVEL, y * size + BEVEL);
  context.lineTo(x * size + BEVEL, (y + 1) * size - BEVEL);
  context.lineTo(x * size, (y + 1) * size);
  context.fill();
  context.closePath();

  context.beginPath();
  context.fillStyle = 'rgba(255,255,255,0.55)';
  context.moveTo(x * size, y * size);
  context.lineTo(x * size + BEVEL, y * size + BEVEL);
  context.lineTo((x + 1) * size - BEVEL, y * size + BEVEL);
  context.lineTo((x + 1) * size, y * size);
  context.fill();
  context.closePath();

  context.beginPath();
  context.fillStyle = 'rgba(0,0,0,0.35)';
  context.moveTo((x + 1) * size, y * size);
  context.lineTo((x + 1) * size - BEVEL, y * size + BEVEL);
  context.lineTo((x + 1) * size - BEVEL, (y + 1) * size - BEVEL);
  context.lineTo((x + 1) * size, (y + 1) * size);
  context.fill();
  context.closePath();

  context.beginPath();
  context.fillStyle = 'rgba(0,0,0,0.45)';
  context.moveTo(x * size, (y + 1) * size);
  context.lineTo(x * size + BEVEL, (y + 1) * size - BEVEL);
  context.lineTo((x + 1) * size - BEVEL, (y + 1) * size - BEVEL);
  context.lineTo((x + 1) * size, (y + 1) * size);
  context.fill();
  context.closePath();
};

var TetrisShape = function(shape) {
  this.rotations = shape.rotations;
  this.rotationState = 0;
  this.data = this.rotations[this.rotationState].data;
  this.x = shape.x;
  this.y = 0;
  this.height = this.rotations[this.rotationState].height;
  this.width  = this.rotations[this.rotationState].width;
  this.color  = shape.color;
};

TetrisShape.prototype = {
  rotr: function() {
    this.rotationState++;
    this.rotationState %= this.rotations.length;
    this.data   = this.rotations[this.rotationState].data;
    this.height = this.rotations[this.rotationState].height;
    this.width  = this.rotations[this.rotationState].width;
  },
  rotl: function() {
    this.rotationState--;
    if (this.rotationState < 0) {
      this.rotationState = this.rotations.length - 1;
    }
    this.data   = this.rotations[this.rotationState].data;
    this.height = this.rotations[this.rotationState].height;
    this.width  = this.rotations[this.rotationState].width;
  },
  forEach: function(FN, caller) {
    FN = caller ? FN.bind(caller) : FN;
    for (var y = 0; y < this.data.length; y++) {
      for (var x = 0; x < this.data[0].length; x++) {
        FN(this.data[y][x], x, y);
      }
    }
  }
};

var TetrisGrid = function(rows, columns) {
  this.width = columns;
  this.height = rows + 2;
  this.data = Array.apply(null, new Array(rows + 2))
    .map(function() {
      return Array.apply(null, new Array(columns))
        .map(function() { return 0; });
    });
  this.activeShape = null;
};

TetrisGrid.prototype = {
  dropShape: function(shape) {
    shape.x = ~~(this.width / 2 - shape.size / 2);
    this.renderShape(this.activeShape = new TetrisShape(shape));
    return this.activeShape;
  },
  clearShape: function(shape) {
    shape.forEach(function(e, x, y) {
      if (e === 1 && this.data[y + shape.y]) {
        this.data[y + shape.y][x + shape.x] = 0;
      }
    }, this);
  },
  renderShape: function(shape) {
    shape.forEach(function(e, x, y) {
      if (e === 1 && this.data[y + shape.y]) {
        this.data[y + shape.y][x + shape.x] = 1;
      }
    }, this);
  },
  hasXConflict: function(shape, dx) {
    if (shape.x + shape.size === this.width && dx === 1) {
      return true;
    }
    var y, x;
    if (dx === -1) {
      for (y = 0; y < shape.data.length; y++) {
        for (x = 0; x < shape.data[0].length; x++) {
          if (shape.data[y][x] === 1) {
            if (this.data[y + shape.y][x + shape.x + dx] !== 0) {
              return true;
            }
            break;
          }
        }
      }
    } else {
      for (y = 0; y < shape.data.length; y++) {
        for (x = shape.data[0].length - 1; x !== -1; x--) {
          if (shape.data[y][x] === 1) {
            if (this.data[y + shape.y][x + shape.x + dx] !== 0) {
              return true;
            }
            break;
          }
        }
      }
    }
    return false;
  },
  hasYConflict: function(shape, dy) {
    if (shape.y + shape.size === this.height) {
      return true;
    }
    for (var y = 0; y < shape.data.length; y++) {
      for (var x = 0; x < shape.data[0].length; x++) {
        if (shape.data[y][x] === 1) {
          if (!this.data[y + shape.y + dy] ||
              this.data[y + shape.y + dy][x + shape.x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  },
  hasRotationConflict: function(shape) {
    if ((shape.x < 0 || shape.x + shape.size > this.width) ||
        (shape.y < 0 || shape.y + shape.size > this.height))
    {
      return true;
    }
    for (var y = 0; y < shape.data.length; y++) {
      for (var x = 0; x < shape.data[0].length; x++) {
        if (shape.data[y][x] === 1) {
          if (!this.data[shape.y + y] ||
              this.data[shape.y + y][shape.x + x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  },
  rotateShape: function(shape) {
    this.clearShape(shape);
    shape.rotr();
    if (this.hasRotationConflict(shape)) {
      shape.rotl();
      this.renderShape(shape);
      return;
    }
    this.renderShape(shape);
  },
  moveShape: function(shape, dx) {
    if (this.hasXConflict(shape, dx)) {
      return false;
    }
    this.clearShape(shape);
    shape.x += dx;
    this.renderShape(shape);
  },
  nextIteration: function() {
    this.clearShape(this.activeShape);
    if (!this.hasYConflict(this.activeShape, 1)) {
      this.activeShape.y++;
    } else {
      this.renderShape(this.activeShape);
      return true;
    }
    this.renderShape(this.activeShape);
    return false;
  }
};

var TetrisPieces = {
  I: {
    rotations: [ 0xf00, 0x2222, 0xf0, 0x4444 ],
    size: 4,
    color: '#00f0f0',
  },
  J: {
    rotations: [ 0x138, 0xd2, 0x39, 0x96 ],
    size: 3,
    color: '#0000f0'
  },
  L: {
    rotations: [ 0x78, 0x93, 0x3c, 0x192 ],
    size: 3,
    color: '#f0a000'
  },
  O: {
    rotations: [ 0x660 ],
    size: 4,
    color: '#f0f000'
  },
  S: {
    rotations: [ 0xf0, 0x99, 0x1e, 0x132 ],
    size: 3,
    color: '#00f000'
  },
  T: {
    rotations: [ 0xb8, 0x9a, 0x3a, 0xb2 ],
    size: 3,
    color: '#a000f0'
  },
  Z: {
    rotations: [ 0x198, 0x5a, 0x33, 0xb4 ],
    size: 3,
    color: '#f00000'
  }
};

var unmaskPiece = function(piece) {
  var rotations = [];
  piece.rotations.forEach(function(e) {
    var rt = [], rw = [];
    for (var i = Math.pow(piece.size, 2) - 1; i !== -1; i--) {
      rw.push(+!!(e & (1 << i)));
      if (rw.length % piece.size === 0) {
        rt.push(rw);
        rw = [];
      }
    }
    rotations.push({
      data: rt,
      width: Math.max.apply(null, rt.map(function(e) {
        return e.lastIndexOf(1) - e.indexOf(1) + 1;
      })),
      height: rt.filter(function(e) {
        return e.join('').split('0').join('');
      }).length
    });
  });
  piece.rotations = rotations;
};

Object.keys(TetrisPieces).forEach(function(key) {
  unmaskPiece(TetrisPieces[key]);
});

var NextPiece = function(canvas, width, height, squareSize) {
  canvas.width = width * squareSize;
  canvas.height = height * squareSize;
  var context = canvas.getContext('2d');
  var randomShape = function() {
    var keys = Object.keys(TetrisPieces);
    var shape = TetrisPieces[keys[~~(Math.random() * keys.length)]];
    return shape;
  };
  var nextShape = randomShape();
  return {
    render: function() {
      context.fillStyle = '#dfdfdf';
      context.fillRect(0, 0, canvas.width, canvas.height);
      var next = new TetrisShape(nextShape);
      var offsetX = 1;
      var offsetY = ~~((height - next.height) / 2);
      next.forEach(function(e, x, y) {
        if (e === 1) {
          putPixel(context, squareSize, offsetX + x, offsetY + y, next.color);
        }
      });
    },
    nextShape: function() {
      var lastShape = nextShape;
      nextShape = randomShape();
      return lastShape;
    },
    left: function(x) {
      canvas.style.left = x + 'px';
    },
    top: function(y) {
      canvas.style.top = y + 'px';
    }
  };
};

var Tetris = function(canvas, rows, columns, squareSize) {
  var grid = new TetrisGrid(rows, columns),
      score = 0,
      totalRowsCleared = 0,
      level = 1,
      gameOver = false,
      downHeld = false,
      waitForUp = false;

  var activeShape;

  canvas.width = columns * squareSize;
  canvas.height = rows * squareSize;
  var next = new NextPiece(document.getElementById('next-piece'),
                           6, 5, squareSize),
      boundingRect = canvas.getBoundingClientRect();
  next.left(boundingRect.left + canvas.width);
  next.top(boundingRect.top);

  InfoBox.left(boundingRect.left + canvas.width)
         .top(boundingRect.top + 5 * squareSize)
         .setScore(0)
         .setLevel(1)
         .setRowsCleared(0);

  var context = canvas.getContext('2d');


  var backgroundColor = '#dfdfdf';
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  var clearPixel = function(x, y) {
    context.fillStyle = backgroundColor;
    context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  };

  var clearRow = function(y) {
    context.fillStyle = backgroundColor;
    grid.data[y] = grid.data[y].map(function() { return 0; });
    grid.data.unshift(grid.data.splice(y, 1)[0]);
    context.fillRect(0, y * squareSize - squareSize * 2, canvas.width, squareSize);
    var image = context.getImageData(0, 0, canvas.width, (y - 2) * squareSize);
    context.putImageData(image, 0, squareSize);
  };

  var setHighScore = function() {
    var highScore = +localStorage.getItem('high-score') | 0;
    if (score > highScore) {
      localStorage.setItem('high-score', score);
    }
    InfoBox.setHighScore();
  };

  var randomShape = function() {
    return [next.nextShape(), next.render()][0];
  };

  var renderShape = function() {
    activeShape.forEach(function(e, x, y) {
      if (e === 1) {
        putPixel(context, squareSize, x + activeShape.x, y + activeShape.y - 2, activeShape.color);
      }
    });
  };

  var clearShape = function() {
    activeShape.forEach(function(e, x, y) {
      if (e === 1) {
        clearPixel(x + activeShape.x, y + activeShape.y - 2, activeShape.color);
      }
    });
  };

  var clearRows = function() {
    var rowsCleared = 0;
    waitForUp = true;
    setTimeout(function() {
      waitForUp = false;
    }, 500);
    downHeld = false;
    while (true) {
      var hasCleared = false;
      for (var y = grid.data.length - 1; y !== -1; y--) {
        if (grid.data[y].every(function(e) { return e; })) {
          rowsCleared++;
          clearRow(y);
          hasCleared = true;
          break;
        }
      }
      if (!hasCleared) {
        break;
      }
    }
    if (rowsCleared) {
      var factor;
      switch (rowsCleared) {
        case 1:
          factor = 40;
          break;
        case 2:
          factor = 100;
          break;
        case 3:
          factor = 300;
          break;
        case 4:
          factor = 1200;
          break;
      }
      score += factor * level;
      totalRowsCleared += rowsCleared;
      if (totalRowsCleared % 10 === 0) {
        level++;
        Animation.speed(50);
        InfoBox.setLevel(level);
      }
      InfoBox.setScore(score);
      InfoBox.setRowsCleared(totalRowsCleared);
      setHighScore();
    }
  };

  var Animation = (function() {
    var C = 650;
    var id;
    var left = 0;
    var isAnimating = false;
    var duration = 0;
    var delta;
    var animate = function() {
      if (isAnimating) {
        delta = +Date.now();
        clearShape();
        if (grid.nextIteration()) {
          renderShape();
          clearRows();
          if (activeShape.y <= 1) {
            gameOver = true;
            setHighScore();
            return;
          }
          activeShape = grid.dropShape(randomShape());
          duration = 0;
        } else {
          renderShape();
          duration++;
        }
      }
    };
    function pause() {
      isAnimating = false;
      window.clearInterval(id);
      left = C - (+Date.now() - delta);
    }
    function play() {
      window.setTimeout(function() {
        if (!isAnimating) {
          id = window.setInterval(animate, C);
          isAnimating = true;
          animate();
        }
      }, left);
    }
    var reset = function() {
      isAnimating = false;
      window.clearInterval(id);
      id = window.setInterval(animate, C);
      isAnimating = true;
      animate();
      renderShape();
    };
    return {
      animate: function() {
        if (isAnimating) {
          return;
        }
        isAnimating = true;
        id = window.setInterval(animate, C);
      },
      speed: function(n) {
        C -= n;
        pause();
        play();
      },
      pause: pause,
      play: play,
      reset: reset
    };
  })();

  var advanceLoop = function() {
    clearShape();
    Animation.reset();
    window.setTimeout(function() {
      if (downHeld) {
        advanceLoop();
      }
    }, 50);
  };

  window.addEventListener('keyup', function(event) {
    if (event.which === 40) {
      downHeld = false;
      waitForUp = false;
    }
  });

  window.addEventListener('keydown', function(event) {
    if (gameOver) {
      return;
    }
    switch (event.which) {
      case 37: // Left
        clearShape();
        Animation.pause();
        grid.moveShape(activeShape, -1);
        renderShape();
        Animation.play();
        break;
      case 39: // Right
        clearShape();
        Animation.pause();
        grid.moveShape(activeShape, 1);
        renderShape();
        Animation.play();
        break;
      case 40: // Down
        if (!downHeld && !waitForUp) {
          downHeld = true;
          advanceLoop();
        }
        break;
      case 38: // Up
        clearShape();
        Animation.pause();
        grid.rotateShape(activeShape);
        renderShape();
        Animation.play();
        break;
    }
  });

  InfoBox.setHighScore();
  activeShape = grid.dropShape(randomShape());
  Animation.animate();
};

Tetris(document.getElementById('tetris'), HEIGHT, WIDTH, SIZE);
