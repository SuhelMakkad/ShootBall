const scoreModal = document.querySelector(".modal.score-modal");
const playModeModal = document.querySelector(".modal.play-mode-modal");
const joinGameModal = document.querySelector(".modal.join-game-modal");
const joinCodeModal = document.querySelector(".modal.join-code-modal");
const leaderboardModal = document.querySelector(".modal.leaderboard-modal");
const enterPlayerNameModal = document.querySelector(".modal.enter-name-modal");

const scoreElement = document.getElementById("score");
const modalScoreElement = document.getElementById("modalScore");

const resetButton = document.getElementById("resetButton");
const singlePlayerButton = document.getElementById("singlePlayer");
const multiPlayerButton = document.getElementById("multiPlayer");
const backtoSelectPlayer = document.getElementById("backtoSelectPlayer");
const backToJoinGame = document.getElementById("backToJoinGame");
const codeModalGameStart = document.getElementById("codeModalGameStart");
const copyIdButton = document.getElementById("copyId");
const joinRoomButton = document.getElementById("joinRoom");
const createRoomButton = document.getElementById("createRoom");
const showLeaderboardButton = document.getElementById("showLeaderboardButton");
const backtoScoreModal = document.getElementById("backtoScoreModal");
const enterNameButton = document.getElementById("enterNameButton");
const cancelNameButton = document.getElementById("cancelNameButton");

const topResults = document.getElementById("results");
const rooomIdInput = document.getElementById("roomId");
const singlePlayerName = document.getElementById("singlePlayerName");
const playerNameInput = document.getElementById("playerName");
const playersList = document.getElementById("playersList");

const playerNameReults = document.getElementById("playerNameReults");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const numberOfParticale = 8;
const getRandomId = uuid.v4;

class Player {
  constructor(x, y, radius, color, name) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.name = name;
  }

  draw(offsetx = 0, offsetY = 0) {
    ctx.beginPath();
    ctx.arc(this.x - offsetx, this.y - offsetY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity, velocityMultipler) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.velocityMultipler = velocityMultipler || 10;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x * this.velocityMultipler;
    this.y = this.y + this.velocity.y * this.velocityMultipler;
  }
}

class Particale {
  constructor(x, y, radius, color, velocity, velocityMultipler) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.velocityMultipler = velocityMultipler || 15;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x * this.velocityMultipler;
    this.y = this.y + this.velocity.y * this.velocityMultipler;
    this.alpha -= 0.01;
  }
}

let bulletProjectileRadius = 5,
  projectiles = [],
  particales = [],
  enemies = [],
  supreModIntervalId,
  intervalId,
  secretString = "",
  playersColor = "white",
  secondPlayerColor = "#a229ff",
  animationId,
  score = 0,
  isSinglePlayer,
  playerName,
  playerId,
  gameId,
  isHost = true,
  leaderboard = [],
  players = [new Player(canvas.width / 2, canvas.height / 2, 30, playersColor)];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function init() {
  scoreModal.style.display = "none";
  playModeModal.style.display = "none";
  joinCodeModal.style.display = "none";
  scoreElement.innerHTML = 0;

  bulletProjectileRadius = 5;
  projectiles = [];
  particales = [];
  leaderboard = [];
  enemies = [];
  secretString = "";
  playersColor = "white";
  secondPlayerColor = "#a229ff";
  score = 0;
  animationId = null;
  players = [new Player(canvas.width / 2, canvas.height / 2, 30, playersColor)];

  clearInterval(intervalId);
  clearInterval(supreModIntervalId);
  isHost && spawnEnemies();
  window.removeEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
  });
  animate();
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    // enemies radius ranging from 30 to 8
    const radius = Math.random() * (30 - 8) + 8;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    } else {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    }
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    const enemy = new Projectile(
      x,
      y,
      radius,
      `hsl(${Math.random() * 360}, 80%, 80%)`,
      velocity,
      2
    );
    isSinglePlayer ? enemies.push(enemy) : socket.emit("addEnemy", gameId, enemy);
  }, 1000);
}

function showEnterNameModal() {
  cancelAnimationFrame(animationId);

  modalScoreElement.innerHTML = score;
  enterPlayerNameModal.style.display = "block";
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  animationId = window.requestAnimationFrame(animate);
  players.forEach((player, playerIndex) => {
    player.draw();

    enemies.forEach((enemy, enemyIndex) => {
      const enemyPlayerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (enemyPlayerDist - enemy.radius - player.radius < 1) {
        isSinglePlayer ? showEnterNameModal() : socket.emit("gameOver", gameId);
      }
    });
  });

  particales.forEach((particale, particaleIndex) => {
    if (particale.alpha <= 0) {
      particales.splice(particaleIndex, 1);
    } else {
      particale.update();
    }
  });

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y - projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(projectileIndex, 1);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    projectiles.forEach((projectile, projectileIndex) => {
      const enemyProjectieDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      if (enemyProjectieDist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i <= numberOfParticale; i++) {
          particales.push(
            new Particale(enemy.x, enemy.y, 3, enemy.color, {
              x: Math.random() - 0.5,
              y: Math.random() - 0.5,
            })
          );
        }

        if (enemy.radius - 10 > 10) {
          enemy.radius -= 10;
          projectiles.splice(projectileIndex, 1);
          score += 100;
          if (isSinglePlayer) {
            scoreElement.innerHTML = score;
          } else {
            socket.emit("updateScore", gameId, score);
          }
        } else {
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
            score += 250;
            if (isSinglePlayer) {
              scoreElement.innerHTML = score;
            } else {
              socket.emit("updateScore", gameId, score);
            }
          }, 0);
        }
      }
    });
  });
}

function shootNewBullet(x, y) {
  const angle = Math.atan2(y - players[0].y, x - players[0].x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  const projectile = new Projectile(
    players[0].x + (isHost ? 0 : 80),
    players[0].y,
    bulletProjectileRadius,
    isHost ? playersColor : secondPlayerColor,
    velocity
  );

  isSinglePlayer ? projectiles.push(projectile) : socket.emit("addProjectile", gameId, projectile);
}

window.addEventListener("click", (e) => {
  shootNewBullet(e.clientX, e.clientY);
});

window.addEventListener("keypress", (e) => {
  if (e.key !== "g" || e.key !== "o" || e.key !== "d" || e.key !== "m") {
    // return;
  }
  secretString = e.key === "g" ? "g" : secretString + e.key;
  if (secretString === "godmod") {
    let x = 0,
      y = 0;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
    });

    if (isSinglePlayer) {
      playersColor = "#fc6565";
      players[0].color = playersColor;
    } else {
      if (isHost) {
        playersColor = "#fc6565";
      } else {
        secondPlayerColor = "#fc6565";
      }
      socket.emit("updatePlayerColors", gameId, [playersColor, secondPlayerColor]);
    }
    supreModIntervalId = setInterval(() => {
      shootNewBullet(x, y);
    }, 100);
  }
});

resetButton.addEventListener("click", (e) => {
  e.stopPropagation();
  playModeModal.style.display = "block";
  scoreModal.style.display = "none";
});

singlePlayerButton.addEventListener("click", (e) => {
  e.stopPropagation();
  topResults.style.display = "block";
  isHost = isSinglePlayer = true;
  showLeaderboardButton.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

multiPlayerButton.addEventListener("click", (e) => {
  e.stopPropagation();
  playModeModal.style.display = "none";
  joinGameModal.style.display = "grid";
  isSinglePlayer = false;
  showLeaderboardButton.style.display = "none";
});

backtoSelectPlayer.addEventListener("click", (e) => {
  e.stopPropagation();
  playModeModal.style.display = "block";
  joinGameModal.style.display = "none";
});

backToJoinGame.addEventListener("click", (e) => {
  e.stopPropagation();
  joinCodeModal.style.display = "none";
  joinGameModal.style.display = "grid";
});

joinRoomButton.addEventListener("click", (e) => {
  e.stopPropagation();
  roomId.value = "";
  roomId.disabled = false;
  copyIdButton.style.display = "none";
  joinGameModal.style.display = "none";
  joinCodeModal.style.display = "block";
  codeModalGameStart.setAttribute("type", "join");
});

createRoomButton.addEventListener("click", (e) => {
  e.stopPropagation();
  joinGameModal.style.display = "none";
  joinCodeModal.style.display = "block";
  copyIdButton.style.display = "block";
  roomId.disabled = true;
  codeModalGameStart.setAttribute("type", "create");
  const id = getRandomId();
  roomId.value = id;
  gameId = id;
});

copyIdButton.addEventListener("click", (e) => {
  e.stopPropagation();
  copyTextToClipboard(rooomIdInput.value);
});

showLeaderboardButton.addEventListener("click", (e) => {
  if (!isSinglePlayer) {
    return;
  }
  e.stopPropagation();
  leaderboardModal.style.display = "block";
  scoreModal.style.display = "none";
  playersList.innerHTML = `<li class="leaderboard-players">
                              <span>Loding...</span>
                          </li>`;
  showLeaderboard();
});

backtoScoreModal.addEventListener("click", (e) => {
  e.stopPropagation();
  leaderboardModal.style.display = "none";
  scoreModal.style.display = "block";
});

cancelNameButton.addEventListener("click", (e) => {
  e.stopPropagation();
  enterPlayerNameModal.style.display = "none";
  scoreModal.style.display = "block";
});

enterNameButton.addEventListener("click", (e) => {
  e.stopPropagation();
  playerName = singlePlayerName.value;
  enterPlayerNameModal.style.display = "none";
  playersList.innerHTML = `<li class="leaderboard-players">
                              <span>Loding...</span>
                          </li>`;
  sendScore({ name: playerName, score });
  leaderboardModal.style.display = "block";
});

codeModalGameStart.addEventListener("click", (e) => {
  const type = codeModalGameStart.getAttribute("type");

  e.stopPropagation();
  topResults.style.display = "block";
  gameId = rooomIdInput.value;
  if (type === "join") {
    joinCodeModal.style.display = "none";
    joinNewRoom(gameId);
  } else if (type === "create") {
    createNewRoom();
  }
  init();
});

playerNameInput.addEventListener("input", (e) => {
  playerName = e.target.value;
});
