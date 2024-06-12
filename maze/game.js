document.addEventListener("DOMContentLoaded", function() {
  let cellSize = 20;
  let playerSize = cellSize * 0.8;
  let mazeMap, ctx, canvas;
  let player1, player2, firstPlayerFinished, firstPlayer;

  function initializeGameState() {
    player1 = { x: 0, y: 0, color: "blue", startTime: null, endTime: null, name: "Player 1" };
    player2 = { x: 0, y: 0, color: "orange", startTime: null, endTime: null, name: "Player 2" };
    firstPlayerFinished = false;
    firstPlayer = null;
  }

  function saveSettings() {
    console.log("Settings saved:", player1, player2);
    // Implement the actual save logic here
  }

  document.getElementById("settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();

    initializeGameState();

    player1.name = document.getElementById("player1Name").value;
    player1.color = document.getElementById("player1Color").value;
    player2.name = document.getElementById("player2Name").value;
    player2.color = document.getElementById("player2Color").value;
    player1.startTime = player2.startTime = Date.now();
    const mazeSize = document.getElementById("mazeSize").value;

    saveSettings();
    fetchMaze(mazeSize).then((maze) => {
      mazeMap = maze;
      canvas = document.getElementById("mazeCanvas");
      ctx = canvas.getContext("2d");
      adjustCanvasSize();
      initializePlayerPositions();
      draw();
      document.getElementById("message").style.display = "none"; // Hide message
    });
  });

  window.addEventListener("keydown", (e) => {
    handleKeydown(e);
  });

  async function fetchMaze(size) {
    const response = await fetch(`https://8iusfc8n77.execute-api.us-east-1.amazonaws.com/prod/maze?size=${size}`);
    const data = await response.json();
    return data.mazeMap;
  }

  function adjustCanvasSize() {
    const container = document.querySelector(".canvas-container");
    const aspectRatio = mazeMap[0].length / mazeMap.length;
    let width = container.clientWidth;
    let height = container.clientHeight;

    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;

    cellSize = Math.min(canvas.width / mazeMap[0].length, canvas.height / mazeMap.length);
    playerSize = cellSize * 0.8;

    console.log("Canvas size adjusted: ", canvas.width, canvas.height, "Cell size: ", cellSize);
  }

  function initializePlayerPositions() {
    for (let row = 0; row < mazeMap.length; row++) {
      for (let col = 0; col < mazeMap[0].length; col++) {
        if (mazeMap[row][col] === "E") {
          player1.x = col;
          player1.y = row;
          player2.x = col;
          player2.y = row;
          player1.startTime = player2.startTime = Date.now();
          console.log("Player positions initialized: ", player1, player2);
          return;
        }
      }
    }
  }

  function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rows = mazeMap.length;
    const cols = mazeMap[0].length;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (mazeMap[row][col] === "█") {
          ctx.fillStyle = "black";
        } else if (mazeMap[row][col] === "E") {
          ctx.fillStyle = "green";
        } else if (mazeMap[row][col] === "X") {
          ctx.fillStyle = "red";
        } else {
          ctx.fillStyle = "white";
        }
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
    console.log("Maze drawn");
  }

  function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, playerSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function movePlayer(player, dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (
      newX >= 0 &&
      newX < mazeMap[0].length &&
      newY >= 0 &&
      newY < mazeMap.length &&
      mazeMap[newY][newX] !== "█"
    ) {
      player.x = newX;
      player.y = newY;
      draw();

      if (mazeMap[newY][newX] === "X") {
        player.endTime = Date.now();
        winGame(player);
      }
    }
  }

  function handleKeydown(e) {
    switch (e.key) {
      case "ArrowUp":
        movePlayer(player1, 0, -1);
        break;
      case "ArrowDown":
        movePlayer(player1, 0, 1);
        break;
      case "ArrowLeft":
        movePlayer(player1, -1, 0);
        break;
      case "ArrowRight":
        movePlayer(player1, 1, 0);
        break;
      case "w":
        movePlayer(player2, 0, -1);
        break;
      case "s":
        movePlayer(player2, 0, 1);
        break;
      case "a":
        movePlayer(player2, -1, 0);
        break;
      case "d":
        movePlayer(player2, 1, 0);
        break;
      case "Delete":
      case "Backspace":
        // Simulate form submit
        document.getElementById("settingsForm").dispatchEvent(new Event("submit"));
        break;
    }
  }

  function draw() {
    drawMaze();
    drawPlayer(player1);
    drawPlayer(player2);
    console.log("Players drawn");
  }

  function winGame(player) {
    if (!firstPlayerFinished) {
      firstPlayerFinished = true;
      firstPlayer = player;
      const winnerTime = ((player.endTime - player.startTime) / 1000).toFixed(2);

      const messageDiv = document.getElementById("message");
      messageDiv.innerHTML = `
        ${player.name} WINS!<br>
        Time: ${winnerTime} seconds
      `;
      messageDiv.style.display = "block";

      confetti({
        particleCount: 200,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });

      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: {
              x: Math.random(),
              y: Math.random() - 0.2,
            },
          });
        }, i * 1000);
      }

      saveScore(player.name, winnerTime);
    } else if (player !== firstPlayer) {
      const winnerTime = ((firstPlayer.endTime - firstPlayer.startTime) / 1000).toFixed(2);
      const secondTime = ((player.endTime - player.startTime) / 1000).toFixed(2);
      const timeDifference = (secondTime - winnerTime).toFixed(2);

      const messageDiv = document.getElementById("message");
      messageDiv.innerHTML = `
        ${firstPlayer.name} WINS!<br>
        Time: ${winnerTime} seconds<br>
        ${player.name} came in 2nd!<br>
        Time: ${secondTime} seconds<br>
        +${timeDifference} seconds
      `;
      messageDiv.style.display = "block";

      saveScore(player.name, secondTime);
    }
  }
});
