import { CONFIG } from '../core/Config.js';
import { events } from './EventBus.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { Bird } from '../entities/Bird.js';
import { Pipe } from '../entities/Pipe.js';
import { Ground } from '../entities/Ground.js';
import { GameMode } from '../utils/GameMode.js';
import { DQNAgent } from '../ai/DQNAgent.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.assets = new AssetLoader();
        this.bird = new Bird();
        this.ground = new Ground();
        this.pipes = [];
        this.agent = new DQNAgent();

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE.HIGH_SCORE_KEY)) || 0;

        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.backgroundType = 'day';
        this.mode = GameMode.HUMAN;
        this.renderEnabled = true;

        this.lastPipeSpawn = 0;

        this.init();
    }

    async init() {
        await this.assets.loadImages(CONFIG.ASSETS.IMAGES);
        await this.assets.loadSounds(CONFIG.ASSETS.AUDIO);

        this.setupEventListeners();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        events.emit('game_ready');
    }

    setupEventListeners() {
        const flapHandler = (e) => {
            if (e.type === 'keydown' && !['Space', 'ArrowUp', 'KeyW'].includes(e.code)) return;
            if (this.isRunning && !this.isPaused) {
                this.bird.flap();
                this.playSound('FLAP');
            }
        };

        window.addEventListener('keydown', flapHandler);
        this.canvas.addEventListener('mousedown', flapHandler);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            flapHandler(e);
        }, { passive: false });

        events.on('request_start', () => this.start());
        events.on('request_pause', () => this.togglePause());
        events.on('request_restart', () => this.restart());
        events.on('change_bird', (id) => this.bird.birdType = id);
        events.on('change_bg', (type) => this.backgroundType = type);
        events.on('change_mode', (mode) => this.setMode(mode));
        events.on('request_save_model', () => this.agent.save());
        events.on('request_load_model', () => this.agent.load());
    }

    setMode(mode) {
        this.mode = mode;
        this.renderEnabled = true; // Always enable visuals so user can watch
        if (this.isRunning) this.restart();
    }

    resize() {
        const containerW = window.innerWidth;
        const containerH = window.innerHeight;

        // Maintain logical aspect ratio
        const scale = Math.min(
            containerW / CONFIG.CANVAS.LOGICAL_WIDTH,
            containerH / CONFIG.CANVAS.LOGICAL_HEIGHT,
            CONFIG.CANVAS.BASE_WIDTH / CONFIG.CANVAS.LOGICAL_WIDTH
        );

        this.canvas.width = CONFIG.CANVAS.LOGICAL_WIDTH * scale;
        this.canvas.height = CONFIG.CANVAS.LOGICAL_HEIGHT * scale;

        // Scale context
        this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    start() {
        if (this.isRunning) return;
        this.restart();
    }

    restart() {
        this.bird.reset();
        this.pipes = [];
        this.score = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.lastPipeSpawn = performance.now();

        requestAnimationFrame((t) => this.loop(t));
        events.emit('score_update', this.score);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    loop(timestamp) {
        if (!this.isRunning || this.isPaused) return;

        // If training, we might want to loop multiple times or skip RAF if no render
        let dt = (timestamp - this.lastTime) || 16;
        if (dt > 100) dt = 16; // Reset dt if too large (e.g. after tab switch)
        this.lastTime = timestamp;

        if (this.mode === GameMode.AI_PLAY || this.mode === GameMode.AI_TRAIN) {
            try {
                this.handleAI(dt);
            } catch (e) {
                console.error("AI Logic Error:", e);
            }
        }

        this.update(dt);

        if (this.renderEnabled) {
            this.render();
            requestAnimationFrame((t) => this.loop(t));
        } else {
            // High speed training mode: minimal delay or setImmediate if available
            setTimeout(() => this.loop(performance.now()), 0);
        }
    }

    handleAI(dt) {
        this.currentAIState = this.getState();
        this.currentAIAction = this.agent.predict(this.currentAIState);

        events.emit('ai_step', { epsilon: this.agent.epsilon });

        if (this.currentAIAction === 1) {
            this.bird.flap();
            this.playSound('FLAP');
        }
    }

    update(dt) {
        this.bird.update(dt);
        this.ground.update(dt);

        // Pipe spawning
        const now = performance.now();
        if (now - this.lastPipeSpawn > CONFIG.PIPE.SPAWN_RATE) {
            this.spawnPipe();
            this.lastPipeSpawn = now;
        }

        // Pipe updates & collision
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update(dt);

            // Scoring
            if (!pipe.passed && this.bird.x > pipe.x + pipe.width) {
                pipe.passed = true;
                this.score++;
                this.playSound('SCORE');
                events.emit('score_update', this.score);
            }

            // Collision
            if (this.checkCollision(this.bird, pipe)) {
                this.gameOver();
            }

            if (!pipe.isActive) {
                this.pipes.splice(i, 1);
            }
        }

        // Ground/Ceiling collision
        if (this.bird.y + this.bird.height > this.ground.y || this.bird.y < 0) {
            this.gameOver();
        }

        // AI Learning Outcome
        if (this.mode === GameMode.AI_TRAIN && this.currentAIState) {
            const reward = this.isRunning ? 0.1 : -1.0;
            const nextState = this.getState();
            this.agent.learn(this.currentAIState, this.currentAIAction, reward, nextState, !this.isRunning);
            this.currentAIState = null; // Reset for next frame
        }

        // Auto-restart for AI modes
        if (!this.isRunning && (this.mode === GameMode.AI_TRAIN || this.mode === GameMode.AI_PLAY)) {
            setTimeout(() => this.restart(), 500);
        }
    }

    spawnPipe() {
        const minTop = CONFIG.PIPE.MIN_TOP;
        const maxTop = CONFIG.CANVAS.LOGICAL_HEIGHT - CONFIG.PHYSICS.GROUND_Y_OFFSET - CONFIG.PIPE.GAP - minTop;
        const topHeight = Math.random() * (maxTop - minTop) + minTop;
        this.pipes.push(new Pipe(CONFIG.CANVAS.LOGICAL_WIDTH, topHeight));
    }

    checkCollision(bird, pipe) {
        // Horizontal check
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
            // Vertical check
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + pipe.gap) {
                return true;
            }
        }
        return false;
    }

    gameOver() {
        this.isRunning = false;
        this.playSound('HIT');

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(CONFIG.STORAGE.HIGH_SCORE_KEY, this.highScore);
        }

        events.emit('game_over', { score: this.score, highScore: this.highScore });
    }

    render() {
        this.ctx.clearRect(0, 0, CONFIG.CANVAS.LOGICAL_WIDTH, CONFIG.CANVAS.LOGICAL_HEIGHT);

        // Draw Background
        const bgImg = this.assets.getImage(this.backgroundType === 'day' ? 'BG_DAY' : 'BG_NIGHT');
        this.ctx.drawImage(bgImg, 0, 0, CONFIG.CANVAS.LOGICAL_WIDTH, CONFIG.CANVAS.LOGICAL_HEIGHT);

        // Draw Pipes
        const pipeSprite = this.assets.getImage('PIPE');
        this.pipes.forEach(pipe => pipe.draw(this.ctx, pipeSprite));

        // Draw Ground
        const groundSprite = this.assets.getImage('GROUND');
        this.ground.draw(this.ctx, groundSprite);

        // Draw Bird
        this.bird.draw(this.ctx, this.assets);

        // Draw Score (UI layer could be separate, but drawing here for simple games)
        this.drawScore();
    }

    drawScore() {
        this.ctx.save();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "24px 'Press Start 2P'";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(this.score.toString(), CONFIG.CANVAS.LOGICAL_WIDTH / 2, 40);
        this.ctx.restore();
    }

    playSound(key) {
        if (!this.renderEnabled) return; // Silent in training
        const sound = this.assets.getSound(key);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => { }); // Handle browser audio policies
        }
    }

    /**
     * Environment API (OpenAI Gym style)
     */
    getState() {
        const nextPipe = this.pipes.find(p => p.x + p.width > this.bird.x) || { x: CONFIG.CANVAS.LOGICAL_WIDTH, topHeight: CONFIG.CANVAS.LOGICAL_HEIGHT / 2 };

        return {
            birdY: this.bird.y / CONFIG.CANVAS.LOGICAL_HEIGHT,
            birdVel: this.bird.velocity / CONFIG.PHYSICS.TERMINAL_VELOCITY,
            pipeX: (nextPipe.x - this.bird.x) / CONFIG.CANVAS.LOGICAL_WIDTH,
            pipeGapTop: nextPipe.topHeight / CONFIG.CANVAS.LOGICAL_HEIGHT,
            pipeGapBottom: (nextPipe.topHeight + CONFIG.PIPE.GAP) / CONFIG.CANVAS.LOGICAL_HEIGHT,
            score: this.score,
            isDone: !this.isRunning
        };
    }

    step(action) {
        if (action === 1) { // 1 = FLAP, 0 = IDLE
            this.bird.flap();
            this.playSound('FLAP');
        }

        // The return value (reward) would be calculated here for AI Training
        let reward = 0.1; // Alive reward
        if (!this.isRunning) reward = -1; // Death penalty

        return reward;
    }

    isDone() {
        return !this.isRunning;
    }
}
