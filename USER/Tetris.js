var colors = {
  'I': '0ff',
  'O': 'ff0',
  'T': 'a0f',
  'S': '0f0',
  'Z': 'f00',
  'J': '00f',
  'L': 'fa0'
};

// --- KONFIG ---
var cols = 10, rows = 20;
var blockSize = 16;
var offsetX = 50, offsetY = 10;
var tickSpeed = 500;

// --- JÁTÉKTÉR ---
var board = Array(rows).fill().map(() => Array(cols).fill(0));

// --- DARABOK ---
var pieces = {
  I: [[[0,1],[1,1],[2,1],[3,1]]],
  O: [[[1,0],[2,0],[1,1],[2,1]]],
  T: [[[1,0],[0,1],[1,1],[2,1]]],
  S: [[[1,0],[2,0],[0,1],[1,1]]],
  Z: [[[0,0],[1,0],[1,1],[2,1]]],
  J: [[[0,0],[0,1],[1,1],[2,1]]],
  L: [[[2,0],[0,1],[1,1],[2,1]]]
};

var colors = {
  I: "0ff", O: "ff0", T: "a0f", S: "0f0", Z: "f00", J: "00f", L: "fa0"
};

// --- AKTÍV DARAB ---
var current = null;

// --- SEGÉDFÜGGVÉNYEK ---
function hex3ToRGB(hex) {
  return [
    parseInt(hex[0]+hex[0], 16),
    parseInt(hex[1]+hex[1], 16),
    parseInt(hex[2]+hex[2], 16)
  ];
}

function drawBlock(x, y, color) {
  var rgb = hex3ToRGB(color);
  LCD.setColor(rgb[0], rgb[1], rgb[2]);
  var px = offsetX + x * blockSize;
  var py = offsetY + y * blockSize;
  LCD.fillRect(px+1, py+1, px+blockSize-2, py+blockSize-2);
}

function drawBoard() {
  LCD.clear();
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      if (board[y][x])
        drawBlock(x, y, board[y][x]);
    }
  }
  if (current)
    current.shape.forEach(([dx,dy]) => drawBlock(current.x+dx, current.y+dy, colors[current.type]));
}

function spawnPiece() {
  var types = Object.keys(pieces);
  var t = types[Math.floor(Math.random() * types.length)];
  current = {
    type: t,
    shape: pieces[t][0],
    x: 3,
    y: 0
  };
}

function canMove(dx, dy) {
  return current.shape.every(([px, py]) => {
    var x = current.x + px + dx;
    var y = current.y + py + dy;
    return x >= 0 && x < cols && y < rows && (y < 0 || !board[y][x]);
  });
}

function fixPiece() {
  current.shape.forEach(([dx,dy]) => {
    var x = current.x + dx;
    var y = current.y + dy;
    if (y >= 0) board[y][x] = colors[current.type];
  });
  current = null;
}

function rotate() {
  if (!current) return;
  var newShape = current.shape.map(([x,y]) => [-y,x]);
  if (newShape.every(([dx,dy]) => {
    var x = current.x + dx;
    var y = current.y + dy;
    return x >= 0 && x < cols && y < rows && !board[y][x];
  })) current.shape = newShape;
}

function tick() {
  if (!current) spawnPiece();
  else if (canMove(0,1)) current.y++;
  else {
    fixPiece();
    spawnPiece();
  }
  drawBoard();
}

// --- VEZÉRLÉS ---
setWatch(() => { if (canMove(-1,0)) current.x--; drawBoard(); }, BTN1, { repeat:true, edge:'rising' });
setWatch(() => { if (canMove(1,0)) current.x++; drawBoard(); }, BTN3, { repeat:true, edge:'rising' });
setWatch(() => { if (canMove(0,1)) current.y++; drawBoard(); }, BTN4, { repeat:true, edge:'rising' });
setWatch(() => { rotate(); drawBoard(); }, BTN2, { repeat:true, edge:'rising' });

// --- JÁTÉKINDÍTÁS ---
spawnPiece();
drawBoard();
setInterval(tick, tickSpeed);
