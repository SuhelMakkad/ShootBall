const socket = io("https://shoot-ball-329405.du.r.appspot.com/");

function showLeaderboard() {
  fetch("http://localhost:4000/getLeaderboard")
    .then((data) => data.json())
    .then((reults) => {
      leaderboard = reults;
      playersList.innerHTML = "";
      leaderboard.forEach((reult, index) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        li.classList.add("leaderboard-players");

        const text = `${index + 1}. ${reult.name} - ${reult.score}`;
        span.innerText = text;
        li.appendChild(span);
        playersList.appendChild(li);
      });
    });
}

function sendScore(data) {
  fetch("http://localhost:4000/setScore", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(showLeaderboard);
}

function handleGameOver() {
  cancelAnimationFrame(animationId);
  scoreModal.style.display = "block";
  modalScoreElement.innerHTML = score;
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    //for browsers with no navigator.clipboard api
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {},
    function (err) {
      console.error("error occure while copying", err);
    }
  );

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";
    } catch (err) {
      console.error("error ocuew while copying", err);
    }

    document.body.removeChild(textArea);
  }
}

function createNewRoom() {
  isHost = true;
  socket.emit("createNewRoom", gameId);
}

function joinNewRoom(roomId) {
  isHost = false;
  socket.emit("joinRoom", roomId, { width: canvas.width, height: canvas.height });
}

function addNewPlayer() {
  players.push(new Player(players[0].x + 40, players[0].y, 30, secondPlayerColor));
  players[0].x -= 40;
}

socket.on("connect", () => {
  playerId = socket.id;
});

socket.on("playerJoined", (canvasSize) => {
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  players[0].x = canvas.width / 2;
  players[0].y = canvas.height / 2;
  addNewPlayer();
});

socket.on("updateScore", (scor) => {
  score = scor;
  scoreElement.innerHTML = score;
});

socket.on("addProjectile", (projectile) => {
  projectiles.push(
    new Projectile(
      projectile.x,
      projectile.y,
      projectile.radius,
      projectile.color,
      projectile.velocity,
      projectile.velocityMultipler
    )
  );
});

socket.on("addEnemy", (enemy) => {
  enemies.push(
    new Projectile(
      enemy.x,
      enemy.y,
      enemy.radius,
      enemy.color,
      enemy.velocity,
      enemy.velocityMultipler
    )
  );
});

socket.on("updatePlayerColors", (colors) => {
  colors.forEach((color, index) => {
    if (players[index].color !== "#fc6565") {
      players[index].color = color;
    }
  });
});

socket.on("gameOver", handleGameOver);
