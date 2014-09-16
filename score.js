window.InfoBox = (function() {
  var infoBox = document.getElementById('infobox');
  var score = document.getElementById('score');
  var level = document.getElementById('level');
  var rowsCleared = document.getElementById('rows-cleared');
  return {
    left: function(n) {
      infoBox.style.left = n + 'px';
    },
    top: function(n) {
      infoBox.style.top = n + 'px';
    },
    setScore: function(n) {
      score.textContent = n;
    },
    setLevel: function(n) {
      level.textContent = n;
    },
    setRowsCleared: function(n) {
      rowsCleared.textContent = n;
    }
  };
})();
