import { Game } from './core/Game.js';
import { events } from './core/EventBus.js';
import { Dashboard } from './utils/Dashboard.js';

/**
 * Main application entry point
 * FAANG-level orchestration: handles UI-Game bridge
 */
class App {
    constructor() {
        this.game = new Game('gameCanvas');
        this.dashboard = new Dashboard();
        this.setupUI();
    }

    setupUI() {
        // DOM Elements
        const menu = document.getElementById('menu');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const returnHomeBtn = document.getElementById('returnHomeBtn');
        const scoreCard = document.getElementById('scoreCard');
        const finalScoreText = document.getElementById('finalScore');
        const menuHighScore = document.getElementById('menuHighScore');
        const canvas = document.getElementById('gameCanvas');
        const pauseBtn = document.getElementById('pauseBtn');

        // Initial State
        menuHighScore.textContent = this.game.highScore;

        // Start Game
        startBtn.addEventListener('click', () => {
            menu.style.display = 'none';
            canvas.classList.remove('hidden');
            pauseBtn.classList.remove('hidden');
            this.startCountdown(() => {
                events.emit('request_start');
            });
        });

        // Restart
        restartBtn.addEventListener('click', () => {
            scoreCard.classList.add('hidden');
            this.startCountdown(() => {
                events.emit('request_restart');
            });
        });

        // Return Home
        returnHomeBtn.addEventListener('click', () => {
            scoreCard.classList.add('hidden');
            canvas.classList.add('hidden');
            pauseBtn.classList.add('hidden');
            menu.style.display = 'block';
            menuHighScore.textContent = this.game.highScore;
        });

        // Pause
        pauseBtn.addEventListener('click', () => {
            events.emit('request_pause');
            pauseBtn.textContent = this.game.isPaused ? '▶️ Resume' : '⏸ Pause';
        });

        // Instructions
        const showInstructions = document.getElementById('showInstructions');
        const instructions = document.getElementById('instructions');
        const closeInstructions = document.getElementById('closeInstructions');

        showInstructions.addEventListener('click', () => instructions.classList.remove('hidden'));
        closeInstructions.addEventListener('click', () => instructions.classList.add('hidden'));

        // Bird Selection
        document.querySelectorAll('.bird-option').forEach(img => {
            img.addEventListener('click', () => {
                document.querySelectorAll('.bird-option').forEach(b => b.classList.remove('selected'));
                img.classList.add('selected');
                events.emit('change_bird', parseInt(img.dataset.bird));
            });
        });

        // Background Selection
        document.querySelectorAll('.bg-select button').forEach(btn => {
            btn.addEventListener('click', () => {
                events.emit('change_bg', btn.dataset.bg);
            });
        });

        // Mode Selection
        const modeSelect = document.getElementById('modeSelect');
        modeSelect.addEventListener('change', (e) => {
            events.emit('change_mode', e.target.value);
        });

        // Game Events
        events.on('game_over', (data) => {
            finalScoreText.textContent = `Your Score: ${data.score} | High Score: ${data.highScore}`;
            scoreCard.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        });

        events.on('score_update', (score) => {
            // UI score updates if needed (using canvas for now)
        });
    }

    startCountdown(callback) {
        let count = 3;
        const div = document.createElement('div');
        div.className = 'countdown';
        div.textContent = 'READY?';
        document.body.appendChild(div);

        const interval = setInterval(() => {
            if (count > 0) {
                div.textContent = count;
            } else if (count === 0) {
                div.textContent = 'GO!';
            } else {
                clearInterval(interval);
                div.remove();
                callback();
            }
            count--;
        }, 800);
    }
}

// Initialize App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
