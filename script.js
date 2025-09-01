const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const menu = document.querySelector(".menu");
const scoreCard = document.getElementById("scoreCard");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");

// Game variables
let bird, pipes, score, gameOver, gameRunning;
let gravity = 0.6;
let jump = -9;
let pipeGap = 140;
let pipeWidth = 60;
let pipeSpeed = 2.5;
let frame = 0;

// Bird sprite
const birdImg = new Image();
birdImg.src = "bird.png"; // add your bird sprite (32x24 recommended)

// Background & ground
const bg = new Image();
bg.src = "bg.png"; // add sky background
const ground = new Image();
ground.src = "ground.png"; // add moving ground image

function resetGame() {
  bird = { x: 80, y: 200, w: 32, h: 24, vel: 0 };
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  gameRunning = true;
}

// Bird flap
function flap() {
  if (gameRunning && !gameOver) {
    bird.vel = jump;
  }
}

// Start game
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  canvas.style.display = "block";
  resetGame();
  animate();
});

// Restart game
restartBtn.addEventListener("click", () => {
  scoreCard.classList.add("hidden");
  resetGame();
  animate();
});

document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();
});
canvas.addEventListener("click", flap);

// Pipe creation
function createPipe() {
  let top = Math.random() * (canvas.height - pipeGap - 200) + 50;
  pipes.push({ x: canvas.width, y: top });
}

// Draw everything
function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);
  });
}

function drawGround() {
  ctx.drawImage(ground, -(frame * pipeSpeed) % canvas.width, canvas.height - 50, canvas.width, 50);
  ctx.drawImage(ground, canvas.width - (frame * pipeSpeed) % canvas.width, canvas.height - 50, canvas.width, 50);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "24px Poppins";
  ctx.fillText("Score: " + score, 10, 30);
}

// Update game
function update() {
  bird.vel += gravity;
  bird.y += bird.vel;

  // Bird collision with floor/roof
  if (bird.y + bird.h >= canvas.height - 50 || bird.y <= 0) {
    endGame();
  }

  // Move pipes
  pipes.forEach((pipe, i) => {
    pipe.x -= pipeSpeed;

    // Collision
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.w > pipe.x &&
      (bird.y < pipe.y || bird.y + bird.h > pipe.y + pipeGap)
    ) {
      endGame();
    }

    // Scoring
    if (pipe.x + pipeWidth === bird.x) score++;

    if (pipe.x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }
  });

  frame++;
  if (frame % 120 === 0) createPipe();
}

function endGame() {
  gameOver = true;
  gameRunning = false;
  finalScore.textContent = "Your Score: " + score;
  scoreCard.classList.remove("hidden");
}

// Game loop
function animate() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  update();
  drawPipes();
  drawBird();
  drawGround();
  drawScore();

  requestAnimationFrame(animate);
}
