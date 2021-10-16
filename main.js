const modal = document.querySelector(".modal");
const scoreElement = document.getElementById("score");
const modalScoreElement = document.getElementById("modal-score");
const resetButton = document.getElementById("resetButton");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const numberOfParticale = 8;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity, velocityMultipler, alpha) {
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

let player = new Player(canvas.width / 2, canvas.height / 2, 30, "white"),
  bulletProjectileRadius = 5,
  projectiles = [],
  particales = [],
  enemies = [],
  intervalId,
  score = 0;

function init() {
  modal.style.display = "none";
  scoreElement.innerHTML = 0;

  player = new Player(canvas.width / 2, canvas.height / 2, 30, "white");
  bulletProjectileRadius = 5;
  projectiles = [];
  particales = [];
  enemies = [];
  score = 0;

  clearInterval(intervalId);
  spawnEnemies();
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
    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(
      new Projectile(x, y, radius, `hsl(${Math.random() * 360}, 80%, 80%)`, velocity, 5)
    );
  }, 1000);
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const animationId = window.requestAnimationFrame(animate);
  player.draw();

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

    const enemyPlayerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (enemyPlayerDist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      modal.style.display = "block";
      modalScoreElement.innerHTML = score;
      return;
    }

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
          scoreElement.innerHTML = score;
        } else {
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
            score += 250;
            scoreElement.innerHTML = score;
          }, 0);
        }
      }
    });
  });
}

window.addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  projectiles.push(new Projectile(player.x, player.y, bulletProjectileRadius, "white", velocity));
});

resetButton.addEventListener("click", (e) => {
  e.stopPropagation();
  init();
});

init();
