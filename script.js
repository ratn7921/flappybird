// // DOM Elements
// const canvas = document.getElementById("gameCanvas");
// const ctx = canvas.getContext("2d");
// const menu = document.getElementById("menu");
// const startBtn = document.getElementById("startBtn");
// const showInstructions = document.getElementById("showInstructions");
// const instructions = document.getElementById("instructions");
// const closeInstructions = document.getElementById("closeInstructions");
// const pauseBtn = document.getElementById("pauseBtn");
// const scoreCard = document.getElementById("scoreCard");
// const finalScore = document.getElementById("finalScore");
// const restartBtn = document.getElementById("restartBtn");
// const returnHomeBtn = document.getElementById("returnHomeBtn");
// const menuHighScore = document.getElementById("menuHighScore");

// // Images
// const birdSprites = [
//   new Image(), new Image(), new Image()
// ];
// birdSprites[0].src = "images/bird1.png";
// birdSprites[1].src = "images/bird2.png";
// birdSprites[2].src = "images/bird3.png";
// const bgDay = new Image(); bgDay.src = "images/daybg.png";
// const bgNight = new Image(); bgNight.src = "images/nightbg.png";
// const pipeImg = new Image(); pipeImg.src = "images/pipe.png";
// const groundImg = new Image(); groundImg.src = "images/ground.png";

// // Sounds
// const flapSound = new Audio("audio/flap.mp3");
// const hitSound = new Audio("audio/hit.mp3");
// const scoreSound = new Audio("audio/score.mp3");

// // Unlock sounds for iOS/Android
// document.body.addEventListener("touchstart", () => {
//   flapSound.play().catch(()=>{}); flapSound.pause();
//   hitSound.play().catch(()=>{}); hitSound.pause();
//   scoreSound.play().catch(()=>{}); scoreSound.pause();
// }, { once:true });

// // Game State
// let selectedBird = 0;
// let selectedBg = "day";
// let pipes = [];
// let bird, score = 0, highScore = +localStorage.getItem("flappyHighScore") || 0;
// menuHighScore.textContent = highScore;
// let frame = 0, scorePopups = [];
// let pipeGap, pipeWidth, pipeSpeed;
// let gravity = 0.25, lift = -4.6, drag = 0.995;
// let running = false, paused = false, gameOver = false;

// // Responsive canvas
// function resizeCanvas() {
//   const w = Math.min(window.innerWidth * 0.95, 480);
//   canvas.width = w;
//   canvas.height = w * 1.3;
// }
// window.addEventListener("resize", resizeCanvas);
// resizeCanvas();

// // Menu UI
// document.querySelectorAll(".bird-option").forEach(img=>{
//   img.onclick = ()=> {
//     document.querySelectorAll(".bird-option").forEach(b=>b.classList.remove("selected"));
//     img.classList.add("selected");
//     selectedBird = +img.dataset.bird;
//   };
// });
// document.querySelectorAll(".bg-select button").forEach(btn=>{
//   btn.onclick = ()=> selectedBg = btn.dataset.bg;
// });
// startBtn.onclick = ()=> openGame();
// showInstructions.onclick = ()=> instructions.classList.remove("hidden");
// closeInstructions.onclick = ()=> instructions.classList.add("hidden");
// pauseBtn.onclick = ()=> { paused = !paused; if (!paused) animate(); };
// restartBtn.onclick = ()=> { scoreCard.classList.add("hidden"); startCountdown(()=>resetGame()); };
// returnHomeBtn.onclick = ()=> { scoreCard.classList.add("hidden"); showMenu(); };

// // Input
// function flap() {
//   if (!running || paused) return;
//   bird.vel = lift;
//   flapSound.currentTime=0; flapSound.play().catch(()=>{});
// }
// document.addEventListener("keydown", e=>{
//   if (["Space","ArrowUp","KeyW"].includes(e.code)) flap();
// });
// canvas.addEventListener("mousedown", flap);
// canvas.addEventListener("touchstart", flap, {passive:true});

// // Game functions
// function openGame() {
//   menu.style.display="none";
//   canvas.classList.remove("hidden");
//   pauseBtn.classList.remove("hidden");
//   startCountdown(()=>resetGame());
// }
// function showMenu() {
//   menu.style.display="";
//   canvas.classList.add("hidden");
//   pauseBtn.classList.add("hidden");
//   menuHighScore.textContent = highScore;
// }
// function resetGame() {
//   resizeCanvas();
//   pipeGap = Math.floor(canvas.height*0.22);
//   pipeWidth = Math.floor(canvas.width*0.14);
//   pipeSpeed = 2.5;
//   bird = { x:canvas.width*0.2, y:canvas.height*0.4, w:34, h:24, vel:0, angle:0 };
//   pipes=[]; score=0; frame=0; scorePopups=[]; running=true; paused=false; gameOver=false;
//   animate();
// }
// function createPipe() {
//   const top = Math.random()*(canvas.height-pipeGap-120)+40;
//   pipes.push({x:canvas.width, y:top, scored:false});
// }

// // Draw helpers
// function drawBackground() {
//   const bg = (selectedBg==="day"?bgDay:bgNight);
//   ctx.drawImage(bg,0,0,canvas.width,canvas.height);
// }
// function drawGround() {
//   const h=60; const offset=(frame*pipeSpeed)%canvas.width;
//   ctx.drawImage(groundImg,-offset,canvas.height-h,canvas.width, h);
//   ctx.drawImage(groundImg,canvas.width-offset,canvas.height-h,canvas.width,h);
// }
// function drawPipes() {
//   pipes.forEach(p=>{
//     // top (flipped)
//     ctx.save();
//     ctx.translate(p.x+pipeWidth/2,p.y);
//     ctx.scale(1,-1);
//     ctx.drawImage(pipeImg,-pipeWidth/2,0,pipeWidth,canvas.height);
//     ctx.restore();
//     // bottom
//     ctx.drawImage(pipeImg,p.x,p.y+pipeGap,pipeWidth,canvas.height);
//   });
// }
// function drawBird() {
//   const img=birdSprites[selectedBird];
//   ctx.save();
//   ctx.translate(bird.x+bird.w/2,bird.y+bird.h/2);
//   ctx.rotate(bird.angle);
//   ctx.drawImage(img,-bird.w/2,-bird.h/2,bird.w,bird.h);
//   ctx.restore();
// }
// function drawScore() {
//   ctx.fillStyle="#fff"; ctx.font="bold 24px Poppins";
//   ctx.fillText(score,canvas.width/2-ctx.measureText(score).width/2,50);
// }
// function drawPopups() {
//   scorePopups.forEach((p,i)=>{
//     ctx.fillStyle=`rgba(255,223,0,${p.alpha})`;
//     ctx.font="20px Poppins"; ctx.fillText("+1",p.x,p.y);
//     p.y-=1; p.alpha-=0.02; if(p.alpha<=0) scorePopups.splice(i,1);
//   });
// }

// // Update
// function update() {
//   bird.vel+=gravity; bird.vel*=drag; bird.y+=bird.vel;
//   bird.angle += ((bird.vel<0?-0.3:0.6)-bird.angle)*0.1;

//   pipes.forEach((p,i)=>{
//     p.x-=pipeSpeed;
//     if (!p.scored && bird.x>p.x+pipeWidth) {
//       score++; p.scored=true; scoreSound.play().catch(()=>{});
//       scorePopups.push({x:bird.x,y:bird.y,alpha:1});
//       if(score%10===0){pipeGap*=0.95; pipeSpeed*=1.05;}
//     }
//     if (p.x<-pipeWidth) pipes.splice(i,1);
//     if (bird.x+bird.w>p.x && bird.x<p.x+pipeWidth && (bird.y<p.y || bird.y+bird.h>p.y+pipeGap)) {
//       endGame();
//     }
//   });

//   frame++;
//   if(frame%90===0) createPipe();
//   if(bird.y+bird.h>canvas.height-60 || bird.y<0) endGame();
// }

// // Animate
// function animate() {
//   if (!running || paused) return;
//   ctx.clearRect(0,0,canvas.width,canvas.height);
//   drawBackground(); drawPipes(); drawGround(); drawBird(); drawScore(); drawPopups();
//   update();
//   requestAnimationFrame(animate);
// }
// function endGame() {
//   running=false; gameOver=true;
//   hitSound.play().catch(()=>{});
//   highScore=Math.max(highScore,score); localStorage.setItem("flappyHighScore",highScore);
//   finalScore.textContent=`Your Score: ${score} | High Score: ${highScore}`;
//   scoreCard.classList.remove("hidden"); pauseBtn.classList.add("hidden");
// }

// // Countdown
// function startCountdown(cb) {
//   let c=3; const div=document.createElement("div"); div.className="countdown"; document.body.appendChild(div);
//   const iv=setInterval(()=>{
//     div.textContent=c>0?c:"Go!";
//     c--; if(c<-1){clearInterval(iv);div.remove();cb();}
//   },800);
// }

// // Init
// showMenu();
// ---------- Logical game size (OG) ----------
const GAME_W = 288;
const GAME_H = 512;
const GROUND_H = 112;   // OG ground height area

// ---------- DOM ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const showInstructions = document.getElementById("showInstructions");
const instructions = document.getElementById("instructions");
const closeInstructions = document.getElementById("closeInstructions");
const pauseBtn = document.getElementById("pauseBtn");
const scoreCard = document.getElementById("scoreCard");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const returnHomeBtn = document.getElementById("returnHomeBtn");
const menuHighScore = document.getElementById("menuHighScore");

// ---------- Assets ----------
const birdSprites = [new Image(), new Image(), new Image()];
birdSprites[0].src = "images/bird1.png";
birdSprites[1].src = "images/bird2.png";
birdSprites[2].src = "images/bird3.png";

const bgDay = new Image();  bgDay.src = "images/daybg.png";
const bgNight = new Image(); bgNight.src = "images/nightbg.png";
const pipeImg = new Image(); pipeImg.src = "images/pipe.png";
const groundImg = new Image(); groundImg.src = "images/ground.png";

// ---------- Sounds ----------
const flapSound = new Audio("audio/flap.mp3");
const hitSound = new Audio("audio/hit.mp3");
const scoreSound = new Audio("audio/score.mp3");

// Unlock sounds for mobile
document.body.addEventListener("touchstart", () => {
  [flapSound, hitSound, scoreSound].forEach(a => { a.play().catch(()=>{}); a.pause(); a.currentTime = 0; });
}, { once:true });

// ---------- Game State ----------
let selectedBird = 0;
let selectedBg = "day";
let pipes = [];
let bird;
let score = 0;
let highScore = +localStorage.getItem("flappyHighScore") || 0;
menuHighScore.textContent = highScore;

let frame = 0;
let running = false, paused = false, gameOver = false;

// OG-feel physics (tuned to 60fps)
let gravity = 0.35;
let lift = -6.5;
// No drag in OG feel
let pipeGap = 120;      // OG-ish fixed gap on 512px height
let pipeWidth = 52;
let pipeSpeed = 2.8;    // steady speed

// ---------- Responsive canvas (but render with logical scaling) ----------
function resizeCanvas() {
  // Maintain 288x512 aspect ratio
  const maxW = Math.min(window.innerWidth * 0.95, 480);
  const w = maxW;
  const h = w * (GAME_H / GAME_W);
  canvas.width = w;
  canvas.height = h;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Apply scale before each frame render
function withLogicalScale(drawFn) {
  ctx.save();
  const sx = canvas.width / GAME_W;
  const sy = canvas.height / GAME_H;
  ctx.scale(sx, sy);
  drawFn();
  ctx.restore();
}

// ---------- Menu UI ----------
document.querySelectorAll(".bird-option").forEach(img=>{
  img.onclick = ()=> {
    document.querySelectorAll(".bird-option").forEach(b=>b.classList.remove("selected"));
    img.classList.add("selected");
    selectedBird = +img.dataset.bird;
  };
});
document.querySelectorAll(".bg-select button").forEach(btn=>{
  btn.onclick = ()=> selectedBg = btn.dataset.bg;
});
startBtn.onclick = ()=> openGame();
showInstructions.onclick = ()=> instructions.classList.remove("hidden");
closeInstructions.onclick = ()=> instructions.classList.add("hidden");
pauseBtn.onclick = ()=> { paused = !paused; if (!paused) animate(); };
restartBtn.onclick = ()=> { scoreCard.classList.add("hidden"); startCountdown(()=>resetGame()); };
returnHomeBtn.onclick = ()=> { scoreCard.classList.add("hidden"); showMenu(); };

// ---------- Input ----------
function flap() {
  if (!running || paused) return;
  bird.vel = lift;
  try { flapSound.currentTime = 0; flapSound.play(); } catch(e){}
}
document.addEventListener("keydown", e=>{
  if (["Space","ArrowUp","KeyW"].includes(e.code)) {
    e.preventDefault();
    flap();
  }
}, { passive:false });

// Let user tap/click anywhere to flap during game
document.addEventListener("mousedown", flap);
document.addEventListener("touchstart", flap, { passive:true });

// ---------- Game control ----------
function openGame() {
  menu.style.display="none";
  canvas.classList.remove("hidden");
  pauseBtn.classList.remove("hidden");
  startCountdown(()=>resetGame());
}
function showMenu() {
  menu.style.display="";
  canvas.classList.add("hidden");
  pauseBtn.classList.add("hidden");
  menuHighScore.textContent = highScore;
}
function resetGame() {
  resizeCanvas();
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false; paused = false; running = true;

  // Bird (OG-ish placement and size)
  bird = {
    x: Math.floor(GAME_W * 0.2),
    y: Math.floor(GAME_H * 0.4),
    w: 34,
    h: 24,
    vel: 0,
    angle: 0,
    anim: 0   // for wing cycle
  };

  // Fixed OG-like params
  pipeGap = 120;
  pipeWidth = 52;
  pipeSpeed = 2.8;

  animate();
}

// ---------- Pipes ----------
function createPipe() {
  const minTop = 40;
  const maxTop = GAME_H - GROUND_H - pipeGap - 40;
  const top = Math.random() * (maxTop - minTop) + minTop;
  pipes.push({ x: GAME_W, y: top, scored: false });
}

// ---------- Draw helpers ----------
function drawBackground() {
  const bg = (selectedBg === "day" ? bgDay : bgNight);
  ctx.drawImage(bg, 0, 0, GAME_W, GAME_H);
}
function drawGround(offset) {
  // Two ground tiles scrolling left
  const y = GAME_H - GROUND_H;
  const off = offset % GAME_W;
  ctx.drawImage(groundImg, -off, y, GAME_W, GROUND_H);
  ctx.drawImage(groundImg, GAME_W - off, y, GAME_W, GROUND_H);
}
function drawPipes() {
  pipes.forEach(p => {
    // top (flipped)
    ctx.save();
    ctx.translate(p.x + pipeWidth/2, p.y);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -pipeWidth/2, 0, pipeWidth, GAME_H);
    ctx.restore();
    // bottom
    ctx.drawImage(pipeImg, p.x, p.y + pipeGap, pipeWidth, GAME_H);
  });
}
function drawBird() {
  // Continuous wing animation (cycle 0..2)
  bird.anim = (bird.anim + 0.2) % 3;
  const img = birdSprites[Math.floor(bird.anim)];

  ctx.save();
  ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2);
  ctx.rotate(bird.angle);
  ctx.drawImage(img, -bird.w/2, -bird.h/2, bird.w, bird.h);
  ctx.restore();
}
function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px 'Press Start 2P'";
  const text = String(score);
  const w = ctx.measureText(text).width;
  ctx.fillText(text, (GAME_W - w)/2, 40);
}

// ---------- Update ----------
let groundOffset = 0;

function update() {
  // Bird physics
  bird.vel += gravity;
  bird.y += bird.vel;

  // Angle tweening for visual feel
  const targetAngle = bird.vel < 0 ? -0.35 : 0.8;
  bird.angle += (targetAngle - bird.angle) * 0.1;

  // Pipes
  pipes.forEach((p, i) => {
    p.x -= pipeSpeed;

    // Scoring once when passed
    if (!p.scored && bird.x > p.x + pipeWidth) {
      p.scored = true;
      score++;
      try { scoreSound.currentTime = 0; scoreSound.play(); } catch(e){}
    }

    // Remove off-screen
    if (p.x < -pipeWidth) pipes.splice(i, 1);

    // Collision
    const collideX = (bird.x + bird.w > p.x) && (bird.x < p.x + pipeWidth);
    const collideY = (bird.y < p.y) || (bird.y + bird.h > p.y + pipeGap);
    if (collideX && collideY) {
      endGame();
    }
  });

  // Spawn new pipes at OG-ish cadence (~100 frames @60fps ≈ 1.66s)
  frame++;
  if (frame % 100 === 0) createPipe();

  // Ground collision & ceiling
  if (bird.y + bird.h > GAME_H - GROUND_H || bird.y < 0) {
    endGame();
  }

  // Ground scroll matches pipe speed
  groundOffset += pipeSpeed;
}

// ---------- Animate ----------
function animate() {
  if (!running || paused) return;

  withLogicalScale(() => {
    // Clear + draw
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    drawBackground();
    drawPipes();
    drawGround(groundOffset);
    drawBird();
    drawScore();
  });

  update();
  requestAnimationFrame(animate);
}

// ---------- Game over ----------
function endGame() {
  if (!running) return;
  running = false;
  gameOver = true;
  try { hitSound.currentTime = 0; hitSound.play(); } catch(e){}
  highScore = Math.max(highScore, score);
  localStorage.setItem("flappyHighScore", highScore);
  finalScore.textContent = `Your Score: ${score} | High Score: ${highScore}`;
  scoreCard.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
}

// ---------- Countdown ----------
function startCountdown(cb) {
  let c = 3;
  const div = document.createElement("div");
  div.className = "countdown";
  div.textContent = "GET READY";
  document.body.appendChild(div);

  const iv = setInterval(()=>{
    if (c > 0) {
      div.textContent = c;
    } else if (c === 0) {
      div.textContent = "GO!";
    } else {
      clearInterval(iv);
      div.remove();
      cb();
    }
    c--;
  }, 700);
}

// ---------- Init ----------
function showMenu() {
  menu.style.display = "";
  canvas.classList.add("hidden");
  pauseBtn.classList.add("hidden");
  menuHighScore.textContent = highScore;
}
showMenu();
