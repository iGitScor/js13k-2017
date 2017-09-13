// Game engine modules
var raf = require('./lib/raf');
var rand = require('./lib/rng')();
var kd = require('./lib/keydrown');

// Game canvas
var canvas = document.querySelector('#game');
var ctx = canvas.getContext('2d');

// Game engine modules (dependant on canvas)
var ColorCollision = require('./ColorCollision')(ctx);

var groundType = [
  '#516143',
  '#6F856F',
  '#7B6440',
  '#554128'
];

var W = canvas.width;
var H = canvas.height;

var playerColor = {
  r: 0,
  g: 0,
  b: 0,
  a: 0
};

var playerColorAmount;
var farthestTile;
var score;
var life;

var tiles;
var player;

var reset = function () {
  farthestTile = 0;
  score = 0;
  life = 100;
  tiles = [];

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 5; j++) {
      tiles.push({
        x: i * W / 3,
        y: H - j * H / 3,
        width: W / 3,
        height: H / 3,
        color: rand.pick(groundType)
      });
    }
  }

  player = {
    x: W / 2,
    y: rand.int(H / 2),
    radius: rand.range(20, 30),
    dx: 0,
    dy: 0,
    maxdx: 200,
    maxdy: 200,
    bounce: 0.4,
    color: rand.pick(groundType)
  };

  // First level colors
  groundType = [
    '#516143',
    '#6F856F',
    '#7B6440',
    '#554128'
  ];
};

var changeColor = function () {
  var lostLife = groundType.length > 9 ? rand.range(15, 20) : rand.range(5, 10);
  if (life > lostLife) {
    player.color = rand.pick(groundType);
    life -= lostLife;
  }
};

reset();

raf.start(function (elapsed) {
  kd.tick();
  if (life <= 0) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#D3CEB2';
    ctx.fillRect(0, 0, W, H);

    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign="center";
    ctx.fillText('GAME OVER', W / 2, H / 2 - 15);
    ctx.fillText('Score: ' + score, W / 2, H / 2 + 15);

    return;
  }

  if (score % 100 === 0) {
    player.color = rand.pick(groundType);
  }

  // Clear the screen
  ctx.clearRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  tiles.forEach(function (tile) {
    ctx.fillStyle = tile.color;
    ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
    tile.y += score < 10 ? 1 : Math.max(1, score / 100);
    farthestTile = Math.min(farthestTile, tile.y);
    if (tile.y > H) {
      tile.y = farthestTile;
      tile.color = rand.pick(groundType);
    }
  });

  playerColorAmount = ColorCollision.getColorAmount(
    player.x - player.radius,
    player.y - player.radius,
    player.radius * 2,
    player.radius * 2,
    playerColor
  );

  // Handle collision against the canvas's edges
  if (
    player.x - player.radius < 0
    && player.dx < 0
    || player.x + player.radius > W
    && player.dx > 0
  ) {
    player.dx = -player.dx * player.bounce;
  }
  if (
    player.y - player.radius < 0
    && player.dy < 0
    || player.y + player.radius > H
    && player.dy > 0
  ) {
    player.dy = -player.dy * player.bounce;
  }

  // Update player position
  player.x += player.dx * elapsed;
  player.y += player.dy * elapsed;

  // Render the player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = player.color;
  ctx.strokeStyle = player.color;
  ctx.fill();

  playerColor = ColorCollision.getPointColor(
    player.x + player.radius / 2,
    player.y + player.radius / 2
  );
  var playerColorMax = ColorCollision.getColorAmount(
    player.x - player.radius,
    player.y - player.radius,
    player.radius * 2,
    player.radius * 2,
    playerColor
  );

  if (playerColorAmount < playerColorMax - 1000) {
    ctx.globalAlpha = 0.8 / (1 + rand.range(0, 50) / 100);
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius / 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#D3CEB2';
    ctx.fill();
    life = Math.max(life - (rand.float() / (20 - groundType.length)), 0);
  } else {
    life = Math.min(100, life + rand.float());
    score += 1;

    if (groundType.length === 4 && score > 100 && score < 199) {
      groundType.push('#62452A');
      groundType.push('#6C533D');
      groundType.push('#55493A');
    }

    if (groundType.length === 7 && score > 500 && score < 599) {
      groundType.push('#376C3A');
      groundType.push('#266235');
    }

    if (groundType.length === 9 && score > 1000 && score < 1099) {
      groundType.push('#B08F53');
      groundType.push('#FFE8B5');
      groundType.push('#B0996B');
      groundType.push('#8C7D58');
      groundType.push('#FFDA73');
    }
  }

  ctx.globalAlpha = 1;
  ctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'end';
  ctx.fillText('Score: ' + score, W - 20, 30);

  ctx.textAlign = 'start';
  ctx.fillText('Life: ' + parseInt(life, 10), 20, 30);
});

/*
 * Keyboard controls
 */

// Player moves

kd.UP.down(function () {
  player.dy = Math.max(player.dy - 10, -player.maxdy);
});

kd.DOWN.down(function () {
  player.dy = Math.min(player.dy + 10, player.maxdy);
});

kd.LEFT.down(function () {
  player.dx = Math.max(player.dx - 10, -player.maxdx);
});

kd.RIGHT.down(function () {
  player.dx = Math.min(player.dx + 10, player.maxdx);
});

// Other controls

kd.SPACE.up(function () {
  changeColor();
});

kd.ESC.up(function () {
  reset();
});

canvas.addEventListener('touchmove', function (event) {
  event.preventDefault();
  var touch = event.touches[0];
  player.x = touch.clientX;
  player.y = touch.clientY;
}, false);

var timeout;
var lastTouch = 0;

canvas.addEventListener('touchend', function (event) {
  event.preventDefault();
  clearTimeout(timeout);
  var now = (new Date()).getTime();
  var delayBetweenTouch = now - lastTouch;

  if (delayBetweenTouch < 500 && delayBetweenTouch > 0) {
    changeColor();
    lastTouch = 0;
  } else {
    timeout = setTimeout(function() {
      clearTimeout(timeout);
    }, 500);
    lastTouch = now;
  }
}, false);
