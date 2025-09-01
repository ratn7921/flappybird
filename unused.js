
// // })();
// // 🎮 Enhanced Flappy Bird AAA Experience
// const canvas = document.getElementById("gameCanvas");
// const ctx = canvas.getContext("2d");

// // Responsive canvas
// canvas.width = Math.min(window.innerWidth, 480);
// canvas.height = Math.min(window.innerHeight, 720);

// // Sounds
// const flapSound = new Audio("flap.mp3");
// const pointSound = new Audio("point.mp3");
// const hitSound = new Audio("hit.mp3");

// // Bird
// let bird = {
//   x: 80,
//   y: canvas.height / 2,
//   width: 34,
//   height: 24,
//   gravity: 0.6,
//   lift: -10,
//   velocity: 0,
//   rotation: 0
// };

// // Pipes
// let pipes = [];
// let pipeWidth = 60;
// let pipeGap = 150;
// let pipeSpeed = 2;
// let score = 0;
// let highScore = parseInt(localStorage.getItem("flappyHighScore")) || 0;

// // DOM refs
// const landingScreen = document.getElementById("landingScreen");
// const gameOverScreen = document.getElementById("gameOverScreen");
// const playBtn = document.getElementById("playBtn");
// const restartBtn = document.getElementById("restartBtn");
// const scoreUI = document.getElementById("score");
// const bestScoreUI = document.getElementById("bestScore");
// const finalScore = document.getElementById("finalScore");
// const finalBest = document.getElementById("finalBest");

// // Game state
// let state = "START"; // START | PLAYING | GAMEOVER

// // Controls
// document.addEventListener("keydown", e => { if (e.code === "Space") flap(); });
// canvas.addEventListener("click", flap);
// playBtn.addEventListener("click", startGame);
// restartBtn.addEventListener("click", startGame);

// function flap() {
//   if (state !== "PLAYING") return;
//   bird.velocity = bird.lift;
//   flapSound.play();
// }

// // Speed reward
// function setSpeed(level) {
//   if (level === "slow") pipeSpeed = 1.5;
//   if (level === "fast") pipeSpeed = 3.5;
// }

// // Background
// function drawBackground() {
//   let g = ctx.createLinearGradient(0, 0, 0, canvas.height);
//   g.addColorStop(0, "#1c92d2");
//   g.addColorStop(1, "#f2fcfe");
//   ctx.fillStyle = g;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
// }

// // Bird
// function drawBird() {
//   ctx.save();
//   ctx.translate(bird.x, bird.y);
//   ctx.rotate(bird.rotation);
//   ctx.fillStyle = "#ffdd57";
//   ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
//   ctx.restore();
// }

// // Pipes
// function drawPipes() {
//   ctx.fillStyle = "#4caf50";
//   pipes.forEach(pipe => {
//     ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
//     ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
//   });
// }

// // HUD
// function drawScore() {
//   ctx.fillStyle = "#fff";
//   ctx.font = "bold 28px Arial";
//   ctx.fillText(`Score: ${score}`, 20, 40);
//   ctx.fillText(`High Score: ${highScore}`, 20, 80);
// }

// // Update bird
// function updateBird() {
//   bird.velocity += bird.gravity;
//   bird.y += bird.velocity;
//   bird.rotation = bird.velocity * 0.05;

//   if (bird.y + bird.height / 2 >= canvas.height) {
//     gameOver();
//   }
//   if (bird.y - bird.height / 2 <= 0) {
//     bird.y = bird.height / 2;
//   }
// }

// // Update pipes
// function updatePipes() {
//   if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
//     let top = Math.random() * (canvas.height - pipeGap - 100) + 50;
//     pipes.push({ x: canvas.width, top: top, bottom: canvas.height - (top + pipeGap) });
//   }

//   pipes.forEach((pipe, index) => {
//     pipe.x -= pipeSpeed;

//     // Collision
//     if (
//       bird.x + bird.width / 2 > pipe.x &&
//       bird.x - bird.width / 2 < pipe.x + pipeWidth &&
//       (bird.y - bird.height / 2 < pipe.top || bird.y + bird.height / 2 > canvas.height - pipe.bottom)
//     ) {
//       hitSound.play();
//       gameOver();
//     }

//     // Score
//     if (pipe.x + pipeWidth === bird.x) {
//       score++;
//       pointSound.play();
//       if (score % 5 === 0) setSpeed("fast");
//       if (score % 7 === 0) setSpeed("slow");
//       if (score > highScore) {
//         highScore = score;
//         localStorage.setItem("flappyHighScore", highScore);
//       }
//     }

//     if (pipe.x + pipeWidth < 0) pipes.splice(index, 1);
//   });
// }

// // Game loop
// function gameLoop() {
//   drawBackground();

//   if (state === "START") {
//     // Bird floats gently
//     bird.y += Math.sin(Date.now() / 200) * 0.5;
//     drawBird();
//   }

//   if (state === "PLAYING") {
//     updateBird();
//     updatePipes();
//     drawPipes();
//     drawBird();
//     drawScore();
//     scoreUI.textContent = score;
//     bestScoreUI.textContent = highScore;
//   }

//   requestAnimationFrame(gameLoop);
// }

// // Start game
// function startGame() {
//   state = "PLAYING";
//   landingScreen.classList.add("hidden");
//   gameOverScreen.classList.add("hidden");
//   pipes = [];
//   score = 0;
//   bird.y = canvas.height / 2;
//   bird.velocity = 0;
//   pipeSpeed = 2;
// }

// // Game over
// function gameOver() {
//   if (state !== "PLAYING") return;
//   state = "GAMEOVER";
//   finalScore.textContent = score;
//   finalBest.textContent = highScore;
//   setTimeout(() => {
//     gameOverScreen.classList.remove("hidden");
//   }, 500);
// }

// gameLoop();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Game variables
let bird = { x: 80, y: 250, width: 30, height: 30, velocity: 0, gravity: 0.4, lift: -7 };
let pipes = [];
let score = 0;
let gameOver = false;
let pipeSpeed = 2.5; // Default speed
let frameCount = 0;

// Event listeners for controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    flap();
  }
});

canvas.addEventListener("click", flap); // Tap for mobile

function flap() {
  if (!gameOver) {
    bird.velocity = bird.lift;
  } else {
    restartGame();
  }
}

// Speed buttons (reward system)
document.getElementById("slowBtn")?.addEventListener("click", () => {
  pipeSpeed = 2;
});

document.getElementById("fastBtn")?.addEventListener("click", () => {
  pipeSpeed = 4;
});

// Restart game
function restartGame() {
  bird.y = 250;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  gameOver = false;
  animate();
}

// Pipe generation
function createPipe() {
  let gap = 150;
  let topHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - (topHeight + gap),
    width: 50
  });
}

// Draw everything
function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.width / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top); // Top pipe
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom); // Bottom pipe
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

// Update physics & game logic
function update() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height / 2 >= canvas.height || bird.y - bird.height / 2 <= 0) {
    gameOver = true;
  }

  // Pipe movement & collision
  pipes.forEach((pipe, i) => {
    pipe.x -= pipeSpeed;

    // Collision check
    if (
      bird.x + bird.width / 2 > pipe.x &&
      bird.x - bird.width / 2 < pipe.x + pipe.width &&
      (bird.y - bird.height / 2 < pipe.top ||
        bird.y + bird.height / 2 > canvas.height - pipe.bottom)
    ) {
      gameOver = true;
    }

    // Scoring
    if (pipe.x + pipe.width === bird.x) {
      score++;
    }

    // Remove old pipes
    if (pipe.x + pipe.width < 0) {
      pipes.splice(i, 1);
    }
  });

  frameCount++;
  if (frameCount % 120 === 0) {
    createPipe();
  }
}

// Main loop
function animate() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "32px Arial";
    ctx.fillText("Game Over!", 120, 250);
    ctx.fillStyle = "white";
    ctx.fillText("Click or Press Space to Restart", 40, 320);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawBird();
  drawPipes();
  drawScore();
  requestAnimationFrame(animate);
}

// Start
createPipe();
animate();
