window.InfoBox = (function() {
  var infoBox = document.getElementById('infobox');
  var score = document.getElementById('score');
  var level = document.getElementById('level');
  var rowsCleared = document.getElementById('rows-cleared');
  var highScore = document.getElementById('high-score');
  return {
    left: function(n) {
      infoBox.style.left = n + 'px';
      return this;
    },
    top: function(n) {
      infoBox.style.top = n + 'px';
      return this;
    },
    setScore: function(n) {
      score.textContent = n;
      return this;
    },
    setLevel: function(n) {
      level.textContent = n;
      return this;
    },
    setRowsCleared: function(n) {
      rowsCleared.textContent = n;
      return this;
    },
    setHighScore: function() {
      highScore.textContent = localStorage.getItem('high-score') | 0;
      return this;
    }
  };
})();
