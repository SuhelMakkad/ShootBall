const scoreModal = document.querySelector(".modal.score-modal");
const playModeModal = document.querySelector(".modal.play-mode-modal");
const joinGameModal = document.querySelector(".modal.join-game-modal");
const joinCodeModal = document.querySelector(".modal.join-code-modal");

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

const topResults = document.getElementById("results");
const rooomIdInput = document.getElementById("roomId");
const playerNameInput = document.getElementById("playerName");

const playerNameReults = document.getElementById("playerNameReults");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const numberOfParticale = 8;
const getRandomId = uuid.v4;

let isSinglePlayer,
  playerName,
  playerId,
  gameId,
  isHost = true;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
  players = [new Player(canvas.width / 2, canvas.height / 2, 30, playersColor)];

function init() {
  scoreModal.style.display = "none";
  playModeModal.style.display = "none";
  joinCodeModal.style.display = "none";
  scoreElement.innerHTML = 0;

  bulletProjectileRadius = 5;
  projectiles = [];
  particales = [];
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

function initMultiPlayer() {
  scoreModal.style.display = "none";
  playModeModal.style.display = "none";
  joinCodeModal.style.display = "none";
  scoreElement.innerHTML = 0;

  bulletProjectileRadius = 5;
  projectiles = [];
  particales = [];
  enemies = [];
  secretString = "";
  playersColor = "white";
  score = 0;
  animationId = null;
  players = [new Player(canvas.width / 2, canvas.height / 2, 30, playersColor)];

  clearInterval(intervalId);
  clearInterval(supreModIntervalId);
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

function handleGameOver() {
  cancelAnimationFrame(animationId);
  scoreModal.style.display = "block";
  modalScoreElement.innerHTML = score;
  return;
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  animationId = window.requestAnimationFrame(animate);
  players.forEach((player, playerIndex) => {
    player.draw();

    enemies.forEach((enemy, enemyIndex) => {
      const enemyPlayerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (enemyPlayerDist - enemy.radius - player.radius < 1) {
        isSinglePlayer ? handleGameOver() : socket.emit("gameOver", gameId);
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
    } else {
      if (isHost) {
        playersColor = "#fc6565";
      } else {
        secondPlayerColor = "#fc6565";
      }
    }
    socket.emit("updatePlayerColors", gameId, [playersColor, secondPlayerColor]);
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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

multiPlayerButton.addEventListener("click", (e) => {
  e.stopPropagation();
  playModeModal.style.display = "none";
  joinGameModal.style.display = "grid";
  isSinglePlayer = false;
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
  initSocketIo();
  console.log(socket);
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
  initSocketIo();
  console.log(socket);
});

copyIdButton.addEventListener("click", (e) => {
  e.stopPropagation();
  copyTextToClipboard(rooomIdInput.value);
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

let socket;

function initSocketIo() {
  socket = io("http://localhost:4000");

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
}
