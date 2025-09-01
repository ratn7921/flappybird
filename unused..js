// // Flappy — single-file game logic (linked from index.html)
// // Author: consolidated & debugged version

// (() => {
//   // Config
//   const CONFIG = {
//     CANVAS_W: 480,
//     CANVAS_H: 640,
//     BIRD_W: 36,
//     BIRD_H: 24,
//     BIRD_X: 80,
//     GRAVITY: 0.45,
//     FLAP_V: -7.8,
//     PIPE_W: 60,
//     PIPE_GAP: 150,
//     PIPE_SPEED: 2.2,
//     PIPE_SPAWN_MIN: 110, // px from right
//     PIPE_SPAWN_DELTA: 180, // px gap variance
//     GROUND_H: 40
//   };

//   // DOM
//   const canvas = document.getElementById("gameCanvas");
//   const ctx = canvas.getContext("2d");
//   const scoreEl = document.getElementById("score");
//   const bestEl = document.getElementById("bestScore");
//   const landing = document.getElementById("landingScreen");
//   const playBtn = document.getElementById("playBtn");
//   const gameOverScreen = document.getElementById("gameOverScreen");
//   const finalScoreEl = document.getElementById("finalScore");
//   const finalBestEl = document.getElementById("finalBest");
//   const restartBtn = document.getElementById("restartBtn");
//   const pauseBtn = document.getElementById("pauseBtn");
//   const resetBtn = document.getElementById("resetBtn");

//   // state
//   let bird, pipes, score, bestScore, running, paused, lastTimestamp, frameReqId;

//   // init canvas fixed size
//   canvas.width = CONFIG.CANVAS_W;
//   canvas.height = CONFIG.CANVAS_H;

//   function loadBest() {
//     return parseInt(localStorage.getItem("flappy_best_v2") || "0", 10);
//   }
//   function saveBest(v) {
//     try { localStorage.setItem("flappy_best_v2", String(v)); } catch (e) {}
//   }

//   // Objects
//   function makeBird() {
//     return {
//       x: CONFIG.BIRD_X,
//       y: CONFIG.CANVAS_H / 2,
//       w: CONFIG.BIRD_W,
//       h: CONFIG.BIRD_H,
//       vy: 0,
//       rotation: 0,
//       history: []
//     };
//   }

//   function makePipe(x) {
//     const gap = CONFIG.PIPE_GAP;
//     const topMin = 30;
//     const topMax = CONFIG.CANVAS_H - CONFIG.GROUND_H - gap - 60;
//     const top = Math.floor(topMin + Math.random() * Math.max(1, topMax - topMin));
//     return {
//       x,
//       w: CONFIG.PIPE_W,
//       top,
//       bottom: CONFIG.CANVAS_H - CONFIG.GROUND_H - (top + gap),
//       gap,
//       passed: false
//     };
//   }

//   // Reset / Start
//   function resetGame() {
//     bird = makeBird();
//     pipes = [];
//     score = 0;
//     running = false;
//     paused = false;
//     lastTimestamp = null;
//     bestScore = loadBest();
//     updateHUD();
//     landing.classList.remove("hidden");
//     gameOverScreen.classList.add("hidden");
//   }

//   function startGame() {
//     if (running) return;
//     landing.classList.add("hidden");
//     gameOverScreen.classList.add("hidden");
//     bird = makeBird();
//     pipes = [];
//     score = 0;
//     running = true;
//     paused = false;
//     spawnInitialPipes();
//     lastTimestamp = null;
//     updateHUD();
//     loop(performance.now());
//   }

//   function spawnInitialPipes() {
//     // push a couple of pipes, spaced horizontally
//     const baseX = CONFIG.CANVAS_W + 40;
//     for (let i = 0; i < 3; i++) {
//       pipes.push(makePipe(baseX + i * (CONFIG.PIPE_W + 200)));
//     }
//   }

//   // Input
//   function flap() {
//     if (!running) startGame();
//     if (paused) return;
//     bird.vy = CONFIG.FLAP_V;
//   }

//   // Events
//   document.addEventListener("keydown", (e) => {
//     if (e.code === "Space") {
//       e.preventDefault();
//       flap();
//     } else if (e.code === "KeyP") {
//       togglePause();
//     } else if (e.code === "KeyR") {
//       resetGame();
//       startGame();
//     }
//   });

//   canvas.addEventListener("click", (e) => {
//     flap();
//   });

//   playBtn.addEventListener("click", startGame);
//   restartBtn.addEventListener("click", () => {
//     resetGame();
//     startGame();
//   });

//   pauseBtn.addEventListener("click", togglePause);
//   resetBtn.addEventListener("click", () => {
//     resetGame();
//   });

//   function togglePause() {
//     if (!running) return;
//     paused = !paused;
//     pauseBtn.textContent = paused ? "Resume" : "Pause";
//     if (!paused) {
//       // resume loop
//       lastTimestamp = null;
//       loop(performance.now());
//     }
//   }

//   // Collision helpers
//   function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
//     return !(ax + aw < bx || bx + bw < ax || ay + ah < by || by + bh < ay);
//   }

//   // Update + Draw
//   function update(dt) {
//     // physics
//     bird.vy += CONFIG.GRAVITY;
//     bird.y += bird.vy;
//     // rotation for simple effect
//     bird.rotation = Math.max(-0.6, Math.min(1.2, bird.vy / 12));

//     // ground collision
//     if (bird.y + bird.h / 2 >= CONFIG.CANVAS_H - CONFIG.GROUND_H) {
//       bird.y = CONFIG.CANVAS_H - CONFIG.GROUND_H - bird.h / 2;
//       onGameOver();
//       return;
//     }
//     if (bird.y - bird.h / 2 <= 0) {
//       bird.y = bird.h / 2;
//       bird.vy = 0;
//     }

//     // pipes movement & spawn logic
//     for (let p of pipes) p.x -= CONFIG.PIPE_SPEED;

//     // spawn new pipe when needed
//     const last = pipes[pipes.length - 1];
//     if (!last || last.x < CONFIG.CANVAS_W - 200) {
//       const spawnX = CONFIG.CANVAS_W + Math.floor(40 + Math.random() * 80);
//       pipes.push(makePipe(spawnX));
//     }

//     // remove off-screen & scoring
//     for (let i = pipes.length - 1; i >= 0; i--) {
//       const p = pipes[i];
//       // collision (bird as rect)
//       const birdRect = {
//         x: bird.x - bird.w / 2,
//         y: bird.y - bird.h / 2,
//         w: bird.w,
//         h: bird.h
//       };
//       const topRect = { x: p.x, y: 0, w: p.w, h: p.top };
//       const bottomRect = { x: p.x, y: CONFIG.CANVAS_H - CONFIG.GROUND_H - p.bottom, w: p.w, h: p.bottom };

//       if (rectsOverlap(birdRect.x, birdRect.y, birdRect.w, birdRect.h, topRect.x, topRect.y, topRect.w, topRect.h) ||
//           rectsOverlap(birdRect.x, birdRect.y, birdRect.w, birdRect.h, bottomRect.x, bottomRect.y, bottomRect.w, bottomRect.h)) {
//         onGameOver();
//         return;
//       }

//       // scoring
//       if (!p.passed && p.x + p.w < bird.x - bird.w / 2) {
//         p.passed = true;
//         score += 1;
//         if (score > bestScore) {
//           bestScore = score;
//           saveBest(bestScore);
//         }
//         updateHUD();
//       }

//       // cleanup
//       if (p.x + p.w < -50) pipes.splice(i, 1);
//     }
//   }

//   function draw() {
//     // clear
//     ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

//     // sky gradient
//     const g = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_H);
//     g.addColorStop(0, "#9be7ff");
//     g.addColorStop(1, "#64b5f6");
//     ctx.fillStyle = g;
//     ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

//     // pipes
//     for (const p of pipes) {
//       // top pipe
//       ctx.fillStyle = "#16a34a";
//       ctx.fillRect(p.x, 0, p.w, p.top);
//       ctx.fillStyle = "#15803d";
//       ctx.fillRect(p.x - 6, p.top - 12, p.w + 12, 12);

//       // bottom pipe
//       const bottomY = CONFIG.CANVAS_H - CONFIG.GROUND_H - p.bottom;
//       ctx.fillStyle = "#16a34a";
//       ctx.fillRect(p.x, bottomY, p.w, p.bottom);
//       ctx.fillStyle = "#15803d";
//       ctx.fillRect(p.x - 6, bottomY, p.w + 12, 12);
//     }

//     // ground
//     ctx.fillStyle = "#a0522d";
//     ctx.fillRect(0, CONFIG.CANVAS_H - CONFIG.GROUND_H, CONFIG.CANVAS_W, CONFIG.GROUND_H);

//     // bird (simple rectangle + eye)
//     ctx.save();
//     ctx.translate(bird.x, bird.y);
//     ctx.rotate(bird.rotation);
//     ctx.fillStyle = "#ffcc00";
//     ctx.fillRect(-bird.w / 2, -bird.h / 2, bird.w, bird.h);
//     // eye
//     ctx.fillStyle = "#111827";
//     ctx.beginPath();
//     ctx.arc(bird.w * 0.15, -bird.h * 0.15, 3, 0, Math.PI * 2);
//     ctx.fill();
//     ctx.restore();
//   }

//   function updateHUD() {
//     scoreEl.textContent = String(score);
//     bestEl.textContent = String(bestScore);
//   }

//   function onGameOver() {
//     running = false;
//     paused = false;
//     finalScoreEl.textContent = String(score);
//     finalBestEl.textContent = String(bestScore);
//     gameOverScreen.classList.remove("hidden");
//     landing.classList.add("hidden");
//     updateHUD();
//   }

//   // Game loop
//   function loop(ts) {
//     if (!running || paused) return;
//     if (!lastTimestamp) lastTimestamp = ts;
//     const elapsed = ts - lastTimestamp;
//     lastTimestamp = ts;

//     // clamp delta
//     const dt = Math.min(50, elapsed) / 1000;

//     update(dt);
//     draw();
//     frameReqId = requestAnimationFrame(loop);
//   }

//   // Boot
//   (function boot() {
//     bestScore = loadBest();
//     resetGame();
//     // friendly hint: allow play from landing screen
//     landing.classList.remove("hidden");
//     updateHUD();
//   })();
