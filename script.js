// // // document.addEventListener("DOMContentLoaded", () => {
// // //   const canvas = document.getElementById("gameCanvas");
// // //   const ctx = canvas.getContext("2d");

// // //   const startBtn = document.getElementById("startBtn");
// // //   const menu = document.getElementById("menu");
// // //   const scoreCard = document.getElementById("scoreCard");
// // //   const restartBtn = document.getElementById("restartBtn");
// // //   const finalScore = document.getElementById("finalScore");
// // //   const instructions = document.getElementById("instructions");
// // //   const closeInstructions = document.getElementById("closeInstructions");
// // //   const showInstructions = document.getElementById("showInstructions");
// // //   const pauseBtn = document.getElementById("pauseBtn");

// // //   // Game variables
// // //   let bird, pipes, score, gameOver, gameRunning, frame;
// // //   let gravity = 0.6, jump = -9, pipeGap = 140, pipeWidth = 60, pipeSpeed = 2.5;
// // //   let paused = false;

// // //   let highScore = localStorage.getItem("flappyHighScore") || 0;

// // //   // Bird sprite
// // //   const birdImg = new Image();
// // //   birdImg.src = "bird.png"; // Replace with your sprite

// // //   // Background & ground
// // //   const bg = new Image();
// // //   bg.src = "bg.png";
// // //   const ground = new Image();
// // //   ground.src = "ground.png";

// // //   // Sound effects
// // //   const flapSound = new Audio("flap.mp3");
// // //   const hitSound = new Audio("hit.mp3");
// // //   const scoreSound = new Audio("score.mp3");

// // //   function resetGame() {
// // //     bird = { x: 80, y: 200, w: 32, h: 24, vel: 0 };
// // //     pipes = [];
// // //     score = 0;
// // //     frame = 0;
// // //     gameOver = false;
// // //     gameRunning = true;
// // //     pipeSpeed = 2.5;
// // //     pipeGap = 140;
// // //   }

// // //   // Bird flap
// // //   function flap() {
// // //     if (gameRunning && !gameOver && !paused) {
// // //       bird.vel = jump;
// // //       flapSound.play();
// // //     }
// // //   }

// // //   // Keyboard controls
// // //   document.addEventListener("keydown", e => {
// // //     if (["Space","ArrowUp","KeyW"].includes(e.code)) flap();
// // //   });

// // //   // Touch controls
// // //   canvas.addEventListener("click", flap);
// // //   canvas.addEventListener("touchstart", flap);

// // //   // Pause
// // //   pauseBtn.addEventListener("click", () => {
// // //     paused = !paused;
// // //     pauseBtn.textContent = paused ? "Resume" : "Pause";
// // //     if (!paused) animate();
// // //   });

// // //   // Show instructions
// // //   showInstructions.addEventListener("click", () => {
// // //     instructions.classList.remove("hidden");
// // //   });

// // //   closeInstructions.addEventListener("click", () => {
// // //     instructions.classList.add("hidden");
// // //     menu.style.display = "none";
// // //     canvas.style.display = "block";
// // //     pauseBtn.classList.remove("hidden");
// // //     startCountdown(() => {
// // //       resetGame();
// // //       animate();
// // //     });
// // //   });

// // //   // Start game
// // //   startBtn.addEventListener("click", () => {
// // //     menu.style.display = "none";
// // //     canvas.style.display = "block";
// // //     pauseBtn.classList.remove("hidden");
// // //     startCountdown(() => {
// // //       resetGame();
// // //       animate();
// // //     });
// // //   });

// // //   // Restart game
// // //   restartBtn.addEventListener("click", () => {
// // //     scoreCard.classList.add("hidden");
// // //     pauseBtn.classList.remove("hidden");
// // //     startCountdown(() => {
// // //       resetGame();
// // //       animate();
// // //     });
// // //   });

// // //   // Countdown
// // //   function startCountdown(callback) {
// // //     let count = 3;
// // //     const countdownDiv = document.createElement("div");
// // //     countdownDiv.className = "countdown";
// // //     document.body.appendChild(countdownDiv);

// // //     const interval = setInterval(() => {
// // //       countdownDiv.textContent = count;
// // //       count--;
// // //       if (count < 0) {
// // //         clearInterval(interval);
// // //         document.body.removeChild(countdownDiv);
// // //         callback();
// // //       }
// // //     }, 1000);
// // //   }

// // //   // Pipe creation
// // //   function createPipe() {
// // //     let top = Math.random() * (canvas.height - pipeGap - 200) + 50;
// // //     pipes.push({ x: canvas.width, y: top });
// // //   }

// // //   // Draw functions
// // //   function drawBird() {
// // //     ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);
// // //   }

// // //   function drawPipes() {
// // //     ctx.fillStyle = "green";
// // //     pipes.forEach(pipe => {
// // //       ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
// // //       ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);
// // //     });
// // //   }

// // //   function drawGround() {
// // //     ctx.drawImage(ground, -(frame * pipeSpeed) % canvas.width, canvas.height - 50, canvas.width, 50);
// // //     ctx.drawImage(ground, canvas.width - (frame * pipeSpeed) % canvas.width, canvas.height - 50, canvas.width, 50);
// // //   }

// // //   function drawScore() {
// // //     ctx.fillStyle = "#fff";
// // //     ctx.font = "24px Poppins";
// // //     ctx.fillText("Score: " + score, 10, 30);
// // //     ctx.fillText("High Score: " + highScore, 10, 60);
// // //   }

// // //   // Update
// // //   function update() {
// // //     bird.vel += gravity;
// // //     bird.y += bird.vel;

// // //     if (bird.y + bird.h >= canvas.height - 50 || bird.y <= 0) endGame();

// // //     pipes.forEach((pipe,i) => {
// // //       pipe.x -= pipeSpeed;

// // //       // Collision
// // //       if (
// // //         bird.x < pipe.x + pipeWidth &&
// // //         bird.x + bird.w > pipe.x &&
// // //         (bird.y < pipe.y || bird.y + bird.h > pipe.y + pipeGap)
// // //       ) endGame();

// // //       // Scoring
// // //       if (pipe.x + pipeWidth === bird.x) {
// // //         score++;
// // //         scoreSound.play();
// // //         // Increase difficulty
// // //         if(score > 10) pipeSpeed = 3;
// // //         if(score > 20) pipeGap = 130;
// // //         if(score > 30) pipeSpeed = 3.5;
// // //       }

// // //       if(pipe.x + pipeWidth < 0) pipes.splice(i,1);
// // //     });

// // //     frame++;
// // //     if(frame % 120 === 0) createPipe();
// // //   }

// // //   function endGame() {
// // //     gameOver = true;
// // //     gameRunning = false;
// // //     hitSound.play();
// // //     if(score > highScore) {
// // //       highScore = score;
// // //       localStorage.setItem("flappyHighScore", highScore);
// // //     }
// // //     finalScore.textContent = `Your Score: ${score} | High Score: ${highScore}`;
// // //     scoreCard.classList.remove("hidden");
// // //   }

// // //   // Game loop
// // //   function animate() {
// // //     if(!gameRunning || paused) return;
// // //     ctx.clearRect(0,0,canvas.width,canvas.height);
// // //     ctx.drawImage(bg,0,0,canvas.width,canvas.height);
// // //     update();
// // //     drawPipes();
// // //     drawBird();
// // //     drawGround();
// // //     drawScore();
// // //     requestAnimationFrame(animate);
// // //   }

// // // });


// // document.addEventListener("DOMContentLoaded", () => {
// //   const canvas = document.getElementById("gameCanvas");
// //   const ctx = canvas.getContext("2d");

// //   const startBtn = document.getElementById("startBtn");
// //   const menu = document.getElementById("menu");
// //   const scoreCard = document.getElementById("scoreCard");
// //   const restartBtn = document.getElementById("restartBtn");
// //   const finalScore = document.getElementById("finalScore");
// //   const instructions = document.getElementById("instructions");
// //   const closeInstructions = document.getElementById("closeInstructions");
// //   const showInstructions = document.getElementById("showInstructions");
// //   const pauseBtn = document.getElementById("pauseBtn");

// //   // Game variables
// //   let bird, pipes, score, gameOver, gameRunning, frame;
// //   let gravity = 0.6, jump = -9, pipeGap = 140, pipeWidth = 60, pipeSpeed = 2.5;
// //   let paused = false;
// //   let highScore = localStorage.getItem("flappyHighScore") || 0;

// //   // Bird sprites for wing flapping
// //   const birdSprites = ["images/bird1.png","images/bird2.png","images/bird3.png"].map(src=>{
// //     const img = new Image();
// //     img.src = src;
// //     return img;
// //   });
// //   let birdSpriteIndex = 0;
// //   let flapFrame = 0;

// //   // Background & ground
// //   const bg = new Image(); bg.src = "images/bg.png";
// //   const ground = new Image(); ground.src = "images/ground.png";

// //   // Audio
// //   const flapSound = new Audio("audio/flap.mp3");
// //   const hitSound = new Audio("audio/hit.mp3");
// //   const scoreSound = new Audio("audio/score.mp3");

// //   function resetGame() {
// //     bird = { x: 80, y: 200, w: 32, h: 24, vel: 0, angle:0 };
// //     pipes = [];
// //     score = 0;
// //     frame = 0;
// //     gameOver = false;
// //     gameRunning = true;
// //     pipeSpeed = 2.5;
// //     pipeGap = 140;
// //   }

// //   function flap() {
// //     if (gameRunning && !gameOver && !paused) {
// //       bird.vel = jump;
// //       flapSound.play();
// //     }
// //   }

// //   document.addEventListener("keydown", e => { if(["Space","ArrowUp","KeyW"].includes(e.code)) flap(); });
// //   canvas.addEventListener("click", flap);
// //   canvas.addEventListener("touchstart", flap);

// //   pauseBtn.addEventListener("click", ()=>{
// //     paused = !paused;
// //     pauseBtn.textContent = paused ? "Resume":"Pause";
// //     if(!paused) animate();
// //   });

// //   showInstructions.addEventListener("click", ()=>{instructions.classList.remove("hidden");});
// //   closeInstructions.addEventListener("click", startGameFromInstructions);
// //   startBtn.addEventListener("click", startGameFromInstructions);
// //   restartBtn.addEventListener("click", startGameFromInstructions);

// //   function startGameFromInstructions() {
// //     instructions.classList.add("hidden");
// //     menu.style.display = "none";
// //     canvas.style.display = "block";
// //     pauseBtn.classList.remove("hidden");
// //     startCountdown(()=>{ resetGame(); animate(); });
// //   }

// //   function startCountdown(callback) {
// //     let count=3;
// //     const countdownDiv = document.createElement("div");
// //     countdownDiv.className="countdown";
// //     document.body.appendChild(countdownDiv);
// //     const interval = setInterval(()=>{
// //       countdownDiv.textContent=count;
// //       count--;
// //       if(count<0){ clearInterval(interval); document.body.removeChild(countdownDiv); callback(); }
// //     },1000);
// //   }

// //   function createPipe(){
// //     let top=Math.random()*(canvas.height-pipeGap-200)+50;
// //     pipes.push({x:canvas.width, y:top});
// //   }

// //   function drawBird(){
// //     // rotation based on velocity for wind effect
// //     bird.angle = Math.min(Math.max(bird.vel/10, -0.5), 0.5);
// //     flapFrame++; if(flapFrame%5===0) birdSpriteIndex=(birdSpriteIndex+1)%birdSprites.length;
// //     ctx.save();
// //     ctx.translate(bird.x+bird.w/2, bird.y+bird.h/2);
// //     ctx.rotate(bird.angle);
// //     ctx.drawImage(birdSprites[birdSpriteIndex], -bird.w/2, -bird.h/2, bird.w, bird.h);
// //     ctx.restore();
// //   }

// //   function drawPipes(){
// //     ctx.fillStyle="green";
// //     pipes.forEach(pipe=>{
// //       ctx.fillRect(pipe.x,0,pipeWidth,pipe.y);
// //       ctx.fillRect(pipe.x,pipe.y+pipeGap,pipeWidth,canvas.height-pipe.y-pipeGap);
// //     });
// //   }

// //   function drawGround(){
// //     ctx.drawImage(ground,-(frame*pipeSpeed)%canvas.width,canvas.height-50,canvas.width,50);
// //     ctx.drawImage(ground,canvas.width-(frame*pipeSpeed)%canvas.width,canvas.height-50,canvas.width,50);
// //   }

// //   function drawScore(){
// //     ctx.fillStyle="#fff";
// //     ctx.font="24px Poppins";
// //     ctx.fillText("Score: "+score,10,30);
// //     ctx.fillText("High Score: "+highScore,10,60);
// //   }

// //   function update(){
// //     bird.vel+=gravity;
// //     bird.y+=bird.vel;
// //     if(bird.y+bird.h>=canvas.height-50||bird.y<=0) endGame();
// //     pipes.forEach((pipe,i)=>{
// //       pipe.x-=pipeSpeed;
// //       if(bird.x<pipe.x+pipeWidth && bird.x+bird.w>pipe.x && (bird.y<pipe.y||bird.y+bird.h>pipe.y+pipeGap)) endGame();
// //       if(pipe.x+pipeWidth===bird.x){ score++; scoreSound.play(); if(score>10) pipeSpeed=3; if(score>20) pipeGap=130; if(score>30) pipeSpeed=3.5;}
// //       if(pipe.x+pipeWidth<0) pipes.splice(i,1);
// //     });
// //     frame++;
// //     if(frame%120===0) createPipe();
// //   }

// //   function endGame(){
// //     gameOver=true; gameRunning=false; hitSound.play();
// //     if(score>highScore){ highScore=score; localStorage.setItem("flappyHighScore",highScore);}
// //     finalScore.textContent=`Your Score: ${score} | High Score: ${highScore}`;
// //     scoreCard.classList.remove("hidden");
// //   }

// //   function animate(){
// //     if(!gameRunning||paused) return;
// //     ctx.clearRect(0,0,canvas.width,canvas.height);
// //     ctx.drawImage(bg,0,0,canvas.width,canvas.height);
// //     update();
// //     drawPipes();
// //     drawBird();
// //     drawGround();
// //     drawScore();
// //     requestAnimationFrame(animate);
// //   }

// // });



// // document.addEventListener("DOMContentLoaded", () => {
// //   const canvas = document.getElementById("gameCanvas");
// //   const ctx = canvas.getContext("2d");

// //   const startBtn = document.getElementById("startBtn");
// //   const menu = document.getElementById("menu");
// //   const scoreCard = document.getElementById("scoreCard");
// //   const restartBtn = document.getElementById("restartBtn");
// //   const finalScore = document.getElementById("finalScore");
// //   const instructions = document.getElementById("instructions");
// //   const closeInstructions = document.getElementById("closeInstructions");
// //   const showInstructions = document.getElementById("showInstructions");
// //   const pauseBtn = document.getElementById("pauseBtn");

// //   // Responsive canvas
// //   function resizeCanvas(){
// //     canvas.width = Math.min(window.innerWidth * 0.9, 480);
// //     canvas.height = canvas.width * 1.25; // 4:5 ratio
// //   }
// //   window.addEventListener("resize", resizeCanvas);
// //   resizeCanvas();

// //   // Game variables
// //   let bird, pipes, score, gameOver, gameRunning, frame;
// //   let gravity, jump, pipeGap, pipeWidth, pipeSpeed;
// //   let paused = false;
// //   let highScore = localStorage.getItem("flappyHighScore") || 0;

// //   // Bird sprites
// //   const birdSprites = ["images/bird1.png","images/bird2.png","images/bird3.png"].map(src=>{
// //     const img = new Image();
// //     img.src = src;
// //     return img;
// //   });
// //   let birdSpriteIndex=0, flapFrame=0;

// //   // Background & ground
// //   const bg = new Image(); bg.src="images/bg.png";
// //   const ground = new Image(); ground.src="images/ground.png";

// //   // Audio
// //   const flapSound = new Audio("audio/flap.mp3");
// //   const hitSound = new Audio("audio/hit.mp3");
// //   const scoreSound = new Audio("audio/score.mp3");

// //   function resetGame(){
// //     gravity=canvas.height*0.0012;
// //     jump=-canvas.height*0.018;
// //     pipeGap=canvas.height*0.23;
// //     pipeWidth=canvas.width*0.15;
// //     pipeSpeed=canvas.width*0.005;

// //     bird={ x: canvas.width*0.2, y:canvas.height*0.4, w:32, h:24, vel:0, angle:0 };
// //     pipes=[]; score=0; frame=0; gameOver=false; gameRunning=true;
// //   }

// //   function flap(){
// //     if(gameRunning && !gameOver && !paused){
// //       bird.vel = jump; flapSound.play();
// //     }
// //   }

// //   document.addEventListener("keydown", e=>{if(["Space","ArrowUp","KeyW"].includes(e.code)) flap();});
// //   canvas.addEventListener("click", flap);
// //   canvas.addEventListener("touchstart", flap);

// //   pauseBtn.addEventListener("click", ()=>{
// //     paused=!paused;
// //     pauseBtn.textContent=paused?"Resume":"Pause";
// //     if(!paused) animate();
// //   });

// //   showInstructions.addEventListener("click", ()=>instructions.classList.remove("hidden"));
// //   closeInstructions.addEventListener("click", startGameFromInstructions);
// //   startBtn.addEventListener("click", startGameFromInstructions);
// //   restartBtn.addEventListener("click", startGameFromInstructions);

// //   function startGameFromInstructions(){
// //     instructions.classList.add("hidden");
// //     menu.style.display="none";
// //     canvas.style.display="block";
// //     pauseBtn.classList.remove("hidden");
// //     startCountdown(()=>{ resetGame(); animate(); });
// //   }

// //   function startCountdown(callback){
// //     let count=3;
// //     const countdownDiv = document.createElement("div");
// //     countdownDiv.className="countdown";
// //     document.body.appendChild(countdownDiv);
// //     const interval=setInterval(()=>{
// //       countdownDiv.textContent=count;
// //       count--;
// //       if(count<0){ clearInterval(interval); document.body.removeChild(countdownDiv); callback(); }
// //     },1000);
// //   }

// //   function createPipe(){
// //     let top=Math.random()*(canvas.height-pipeGap-100)+50;
// //     pipes.push({x:canvas.width, y:top});
// //   }

// //   function drawBird(){
// //     bird.angle=Math.min(Math.max(bird.vel/10,-0.5),0.5);
// //     flapFrame++; if(flapFrame%5===0) birdSpriteIndex=(birdSpriteIndex+1)%birdSprites.length;
// //     ctx.save();
// //     ctx.translate(bird.x+bird.w/2, bird.y+bird.h/2);
// //     ctx.rotate(bird.angle);
// //     ctx.drawImage(birdSprites[birdSpriteIndex], -bird.w/2, -bird.h/2, bird.w, bird.h);
// //     ctx.restore();
// //   }

// //   function drawPipes(){
// //     ctx.fillStyle="green";
// //     pipes.forEach(pipe=>{
// //       ctx.fillRect(pipe.x,0,pipeWidth,pipe.y);
// //       ctx.fillRect(pipe.x,pipe.y+pipeGap,pipeWidth,canvas.height-pipe.y-pipeGap);
// //     });
// //   }

// //   function drawGround(){
// //     ctx.drawImage(ground,-(frame*pipeSpeed)%canvas.width,canvas.height-50,canvas.width,50);
// //     ctx.drawImage(ground,canvas.width-(frame*pipeSpeed)%canvas.width,canvas.height-50,canvas.width,50);
// //   }

// //   function drawScore(){
// //     ctx.fillStyle="#fff";
// //     ctx.font=`${Math.floor(canvas.width*0.06)}px Poppins`;
// //     ctx.fillText("Score: "+score,10,canvas.width*0.08);
// //     ctx.fillText("High Score: "+highScore,10,canvas.width*0.16);
// //   }

// //   function update(){
// //     bird.vel+=gravity;
// //     bird.y+=bird.vel;
// //     if(bird.y+bird.h>=canvas.height-50||bird.y<=0) endGame();

// //     pipes.forEach((pipe,i)=>{
// //       pipe.x-=pipeSpeed;
// //       if(bird.x<pipe.x+pipeWidth && bird.x+bird.w>pipe.x && (bird.y<pipe.y || bird.y+bird.h>pipe.y+pipeGap)) endGame();
// //       if(pipe.x+pipeWidth===bird.x){ score++; scoreSound.play(); if(score>10) pipeSpeed=canvas.width*0.006; if(score>20) pipeGap=canvas.height*0.2; if(score>30) pipeSpeed=canvas.width*0.007;}
// //       if(pipe.x+pipeWidth<0) pipes.splice(i,1);
// //     });

// //     frame++;
// //     if(frame%120===0) createPipe();
// //   }

// //   function endGame(){
// //     gameOver=true; gameRunning=false; hitSound.play();
// //     if(score>highScore){ highScore=score; localStorage.setItem("flappyHighScore",highScore);}
// //     finalScore.textContent=`Your Score: ${score} | High Score: ${highScore}`;
// //     scoreCard.classList.remove("hidden");
// //   }

// //   function animate(){
// //     if(!gameRunning||paused) return;
// //     ctx.clearRect(0,0,canvas.width,canvas.height);
// //     ctx.drawImage(bg,0,0,canvas.width,canvas.height);
// //     update();
// //     drawPipes();
// //     drawBird();
// //     drawGround();
// //     drawScore();
// //     requestAnimationFrame(animate);
// //   }

// // });


// document.addEventListener("DOMContentLoaded", () => {
//   const canvas = document.getElementById("gameCanvas");
//   const ctx = canvas.getContext("2d");

//   const startBtn = document.getElementById("startBtn");
//   const menu = document.getElementById("menu");
//   const scoreCard = document.getElementById("scoreCard");
//   const restartBtn = document.getElementById("restartBtn");
//   const finalScore = document.getElementById("finalScore");
//   const instructions = document.getElementById("instructions");
//   const closeInstructions = document.getElementById("closeInstructions");
//   const showInstructions = document.getElementById("showInstructions");
//   const pauseBtn = document.getElementById("pauseBtn");

//   // Bird & BG selection
//   let selectedBird = 0;
//   let selectedBg = "day";
//   document.querySelectorAll(".bird-option").forEach(img => {
//     img.addEventListener("click", () => {
//       document.querySelectorAll(".bird-option").forEach(b => b.classList.remove("selected"));
//       img.classList.add("selected");
//       selectedBird = parseInt(img.dataset.bird);
//     });
//   });
//   document.querySelectorAll(".bg-select button").forEach(btn => {
//     btn.addEventListener("click", () => {
//       selectedBg = btn.dataset.bg;
//     });
//   });

//   // Responsive canvas
//   function resizeCanvas() {
//     canvas.width = Math.min(window.innerWidth * 0.9, 480);
//     canvas.height = canvas.width * 1.25; // 4:5 ratio
//   }
//   window.addEventListener("resize", resizeCanvas);
//   resizeCanvas();

//   // Game variables
//   let bird, pipes, score, gameOver, gameRunning, frame;
//   let pipeGap, pipeWidth, pipeSpeed;
//   let paused = false;
//   let highScore = localStorage.getItem("flappyHighScore") || 0;

//   // Bird sprites
//   const birdSprites = [
//     ["images/bird1.png"],
//     ["images/bird2.png"],
//     ["images/bird3.png"]
//   ].map(arr => {
//     return arr.map(src => {
//       const img = new Image();
//       img.src = src;
//       return img;
//     });
//   });

//   // Backgrounds
//   const bgDay = new Image(); bgDay.src = "images/daybg.png";
//   const bgNight = new Image(); bgNight.src = "images/nightbg.png";
//   const ground = new Image(); ground.src = "images/ground.png";

//   // Audio
//   const flapSound = new Audio("audio/flap.mp3");
//   const hitSound = new Audio("audio/hit.mp3");
//   const scoreSound = new Audio("audio/score.mp3");

//   function resetGame() {
//     pipeGap = canvas.height * 0.23;
//     pipeWidth = canvas.width * 0.15;
//     pipeSpeed = canvas.width * 0.005;

//     bird = { x: canvas.width * 0.2, y: canvas.height * 0.4, w: 34, h: 24 };
//     pipes = [];
//     score = 0;
//     frame = 0;
//     gameOver = false;
//     gameRunning = true;
//   }

//   function flap() {
//     if (gameRunning && !gameOver && !paused) {
//       bird.y -= canvas.height * 0.08; // move up a bit
//       flapSound.play();
//     }
//   }

//   document.addEventListener("keydown", e => { if (["Space", "ArrowUp", "KeyW"].includes(e.code)) flap(); });
//   canvas.addEventListener("click", flap);
//   canvas.addEventListener("touchstart", flap);

//   pauseBtn.addEventListener("click", () => {
//     paused = !paused;
//     pauseBtn.textContent = paused ? "Resume" : "Pause";
//     if (!paused) animate();
//   });

//   showInstructions.addEventListener("click", () => instructions.classList.remove("hidden"));
//   closeInstructions.addEventListener("click", startGameFromInstructions);
//   startBtn.addEventListener("click", startGameFromInstructions);
//   restartBtn.addEventListener("click", startGameFromInstructions);

//   function startGameFromInstructions() {
//     instructions.classList.add("hidden");
//     menu.style.display = "none";
//     canvas.style.display = "block";
//     pauseBtn.classList.remove("hidden");
//     startCountdown(() => { resetGame(); animate(); });
//   }

//   function startCountdown(callback) {
//     let count = 3;
//     const countdownDiv = document.createElement("div");
//     countdownDiv.className = "countdown";
//     document.body.appendChild(countdownDiv);
//     const interval = setInterval(() => {
//       countdownDiv.textContent = count;
//       count--;
//       if (count < 0) {
//         clearInterval(interval);
//         document.body.removeChild(countdownDiv);
//         callback();
//       }
//     }, 1000);
//   }

//   function createPipe() {
//     let top = Math.random() * (canvas.height - pipeGap - 100) + 50;
//     pipes.push({ x: canvas.width, y: top });
//   }

//   function drawBird() {
//     const sprite = birdSprites[selectedBird][0];
//     ctx.drawImage(sprite, bird.x, bird.y, bird.w, bird.h);
//   }

//   function drawPipes() {
//     ctx.fillStyle = "green";
//     pipes.forEach(pipe => {
//       ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
//       ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);
//     });
//   }

//   function drawGround() {
//     ctx.drawImage(ground, -(frame * pipeSpeed) % canvas.width, canvas.height - 50, canvas.width, 50);
//     ctx.drawImage(ground, canvas.width - (frame * pipeSpeed) % canvas.width, canvas.height - 50, canvas.width, 50);
//   }

//   function drawScore() {
//     ctx.fillStyle = "#fff";
//     ctx.font = `${Math.floor(canvas.width * 0.06)}px Poppins`;
//     ctx.fillText("Score: " + score, 10, canvas.width * 0.08);
//     ctx.fillText("High Score: " + highScore, 10, canvas.width * 0.16);
//   }

//   function update() {
//     // Bird won't fall automatically anymore!
//     if (bird.y + bird.h >= canvas.height - 50 || bird.y <= 0) endGame();

//     pipes.forEach((pipe, i) => {
//       pipe.x -= pipeSpeed;
//       if (bird.x < pipe.x + pipeWidth && bird.x + bird.w > pipe.x &&
//         (bird.y < pipe.y || bird.y + bird.h > pipe.y + pipeGap)) endGame();

//       if (pipe.x + pipeWidth === Math.floor(bird.x)) {
//         score++; scoreSound.play();
//         if (score > 10) pipeSpeed = canvas.width * 0.006;
//         if (score > 20) pipeGap = canvas.height * 0.2;
//         if (score > 30) pipeSpeed = canvas.width * 0.007;
//       }
//       if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);
//     });

//     frame++;
//     if (frame % 120 === 0) createPipe();
//   }

//   function endGame() {
//     gameOver = true; gameRunning = false; hitSound.play();
//     if (score > highScore) {
//       highScore = score;
//       localStorage.setItem("flappyHighScore", highScore);
//     }
//     finalScore.textContent = `Your Score: ${score} | High Score: ${highScore}`;
//     scoreCard.classList.remove("hidden");
//   }

//   function animate() {
//     if (!gameRunning || paused) return;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(selectedBg === "day" ? bgDay : bgNight, 0, 0, canvas.width, canvas.height);

//     update();
//     drawPipes();
//     drawBird();
//     drawGround();
//     drawScore();

//     requestAnimationFrame(animate);
//   }
// });



document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const startBtn = document.getElementById("startBtn");
  const menu = document.getElementById("menu");
  const scoreCard = document.getElementById("scoreCard");
  const restartBtn = document.getElementById("restartBtn");
  const finalScore = document.getElementById("finalScore");
  const instructions = document.getElementById("instructions");
  const closeInstructions = document.getElementById("closeInstructions");
  const showInstructions = document.getElementById("showInstructions");
  const pauseBtn = document.getElementById("pauseBtn");

  // Bird & BG selection
  let selectedBird = 0;
  let selectedBg = "day";
  document.querySelectorAll(".bird-option").forEach(img => {
    img.addEventListener("click", () => {
      document.querySelectorAll(".bird-option").forEach(b => b.classList.remove("selected"));
      img.classList.add("selected");
      selectedBird = parseInt(img.dataset.bird);
    });
  });
  document.querySelectorAll(".bg-select button").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedBg = btn.dataset.bg;
    });
  });

  // Responsive canvas
  function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 480);
    canvas.height = canvas.width * 1.25; // 4:5 ratio
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Game variables
  let bird, pipes, score, gameOver, gameRunning, frame;
  let pipeGap, pipeWidth, pipeSpeed;
  let paused = false;
  let highScore = localStorage.getItem("flappyHighScore") || 0;
  let flapFrame = 0, birdSpriteIndex = 0;

  // Bird sprites (3 birds, 3 frames each)
  const birdSprites = [
    ["images/bird1.png","images/bird1.png","images/bird1.png"],
    ["images/bird2.png","images/bird2.png","images/bird2.png"],
    ["images/bird3.png","images/bird3.png","images/bird3.png"],
  ].map(arr => arr.map(src => { const img=new Image(); img.src=src; return img; }));

  // Backgrounds
  const bgDay = new Image(); bgDay.src = "images/daybg.png";
  const bgNight = new Image(); bgNight.src = "images/nightbg.png";
  const ground = new Image(); ground.src = "images/ground.png";

  // Physics
  const gravity = 0.8, lift = -6.5, maxFall = 3;

  // Audio
  const flapSound = new Audio("audio/flap.mp3");
  const hitSound = new Audio("audio/hit.mp3");
  const scoreSound = new Audio("audio/score.mp3");

  function resetGame() {
    pipeGap = canvas.height * 0.23;
    pipeWidth = canvas.width * 0.15;
    pipeSpeed = canvas.width * 0.005;

    bird = { 
      x: canvas.width * 0.2, 
      y: canvas.height * 0.4, 
      w: 34, h: 24, 
      vel: 0, angle: 0 
    };
    pipes = [];
    score = 0;
    frame = 0;
    gameOver = false;
    gameRunning = true;
    flapFrame = 0; birdSpriteIndex = 0;
  }

  function flap() {
    if (gameRunning && !gameOver && !paused) {
      bird.vel = lift;
      flapSound.play();
    }
  }

  document.addEventListener("keydown", e => { if (["Space","ArrowUp","KeyW"].includes(e.code)) flap(); });
  canvas.addEventListener("click", flap);
  canvas.addEventListener("touchstart", flap);

  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
    if (!paused) animate();
  });

  showInstructions.addEventListener("click", () => instructions.classList.remove("hidden"));
  closeInstructions.addEventListener("click", startGameFromInstructions);
  startBtn.addEventListener("click", startGameFromInstructions);
  restartBtn.addEventListener("click", startGameFromInstructions);

  function startGameFromInstructions() {
    instructions.classList.add("hidden");
    menu.style.display = "none";
    canvas.style.display = "block";
    pauseBtn.classList.remove("hidden");
    scoreCard.classList.add("hidden");
    startCountdown(() => { resetGame(); animate(); });
  }

  function startCountdown(callback) {
    let count = 3;
    const countdownDiv = document.createElement("div");
    countdownDiv.className = "countdown";
    document.body.appendChild(countdownDiv);
    const interval = setInterval(() => {
      countdownDiv.textContent = count;
      count--;
      if (count < 0) {
        clearInterval(interval);
        document.body.removeChild(countdownDiv);
        callback();
      }
    }, 1000);
  }

  function createPipe() {
    let top = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({ x: canvas.width, y: top });
  }

  function drawBird() {
    const sprite = birdSprites[selectedBird][birdSpriteIndex];
    ctx.save();
    ctx.translate(bird.x + bird.w/2, bird.y + bird.h/2);
    ctx.rotate(bird.angle);
    ctx.drawImage(sprite, -bird.w/2, -bird.h/2, bird.w, bird.h);
    ctx.restore();
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
    ctx.font = `${Math.floor(canvas.width * 0.06)}px Poppins`;
    ctx.fillText("Score: " + score, 10, canvas.width * 0.08);
    ctx.fillText("High Score: " + highScore, 10, canvas.width * 0.16);
  }

  function update() {
    // Bird physics
    bird.vel += gravity;
    if (bird.vel > maxFall) bird.vel = maxFall;
    bird.y += bird.vel;
    bird.angle = Math.min(Math.max(bird.vel/10, -0.5), 1.2);

    // Wing flapping tied to movement
    flapFrame++;
    if (bird.vel < 0) {
      if (flapFrame % 3 === 0) birdSpriteIndex = (birdSpriteIndex + 1) % 3;
    } else {
      if (flapFrame % 8 === 0) birdSpriteIndex = (birdSpriteIndex + 1) % 3;
    }

    // Collision with ground or top
    if (bird.y + bird.h >= canvas.height - 50 || bird.y <= 0) endGame();

    pipes.forEach((pipe, i) => {
      pipe.x -= pipeSpeed;
      if (bird.x < pipe.x + pipeWidth && bird.x + bird.w > pipe.x &&
        (bird.y < pipe.y || bird.y + bird.h > pipe.y + pipeGap)) endGame();

      if (pipe.x + pipeWidth === Math.floor(bird.x)) {
        score++; scoreSound.play();
        if (score > 10) pipeSpeed = canvas.width * 0.006;
        if (score > 20) pipeGap = canvas.height * 0.2;
        if (score > 30) pipeSpeed = canvas.width * 0.007;
      }
      if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);
    });

    frame++;
    if (frame % 120 === 0) createPipe();
  }

  function endGame() {
    gameOver = true; gameRunning = false; hitSound.play();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("flappyHighScore", highScore);
    }
    finalScore.textContent = `Your Score: ${score} | High Score: ${highScore}`;
    scoreCard.classList.remove("hidden");
  }

  function animate() {
    if (!gameRunning || paused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(selectedBg === "day" ? bgDay : bgNight, 0, 0, canvas.width, canvas.height);

    update();
    drawPipes();
    drawBird();
    drawGround();
    drawScore();

    requestAnimationFrame(animate);
  }
});
