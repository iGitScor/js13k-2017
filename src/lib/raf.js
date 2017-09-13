// Holds last iteration timestamp.
var time = 0;

// Calls `fn` on next frame.
function raf(fn) {
  return window.requestAnimationFrame(function () {
    var now = Date.now();
    var elapsed = now - time;

    if (elapsed > 999) {
      elapsed = 1 / 60;
    } else {
      elapsed /= 1000;
    }

    time = now;
    fn(elapsed);
  });
}

module.exports = {
  // Calls `fn` on every frame with `elapsed` set to the elapsed time in milliseconds.
  start: function (fn) {
    return raf(function tick(elapsed) {
      fn(elapsed);
      raf(tick);
    });
  },
  // Cancels the specified animation frame request.
  stop: function (id) {
    window.cancelAnimationFrame(id);
  }
};
