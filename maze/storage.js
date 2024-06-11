function loadSettings() {
    player1.name = localStorage.getItem('player1Name') || 'Player 1';
    player1.color = localStorage.getItem('player1Color') || '#0000FF';
    player2.name = localStorage.getItem('player2Name') || 'Player 2';
    player2.color = localStorage.getItem('player2Color') || '#FFA500';
    document.getElementById('player1Name').value = player1.name;
    document.getElementById('player1Color').value = player1.color;
    document.getElementById('player2Name').value = player2.name;
    document.getElementById('player2Color').value = player2.color;
    document.getElementById('mazeSize').value = localStorage.getItem('mazeSize') || '10x10';
  }
  
  function saveSettings() {
    localStorage.setItem('player1Name', player1.name);
    localStorage.setItem('player1Color', player1.color);
    localStorage.setItem('player2Name', player2.name);
    localStorage.setItem('player2Color', player2.color);
    localStorage.setItem('mazeSize', document.getElementById('mazeSize').value);
  }
  