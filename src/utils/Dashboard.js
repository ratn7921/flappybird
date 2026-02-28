import { events } from '../core/EventBus.js';

/**
 * AI Training Dashboard
 */
export class Dashboard {
    constructor() {
        this.container = this.createUI();
        this.stats = {
            episodes: 0,
            bestScore: 0,
            avgScore: 0,
            epsilon: 1.0,
            totalSteps: 0
        };
        this.scoreHistory = [];
        this.setupListeners();
    }

    createUI() {
        const div = document.createElement('div');
        div.id = 'trainingDashboard';
        div.className = 'dashboard hidden';
        div.innerHTML = `
            <h3>AI TRAINING STATS</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <span class="label">EPISODES</span>
                    <span id="statEpisodes" class="value">0</span>
                </div>
                <div class="stat-item">
                    <span class="label">BEST SCORE</span>
                    <span id="statBest" class="value">0</span>
                </div>
                <div class="stat-item">
                    <span class="label">AVG SCORE (L10)</span>
                    <span id="statAvg" class="value">0</span>
                </div>
                <div class="stat-item">
                    <span class="label">EPSILON</span>
                    <span id="statEpsilon" class="value">1.0</span>
                </div>
            </div>
            <div class="dashboard-actions">
                <button id="saveModelBtn">💾 SAVE MODEL</button>
                <button id="loadModelBtn">📂 LOAD MODEL</button>
            </div>
        `;
        document.body.appendChild(div);
        return div;
    }

    setupListeners() {
        events.on('change_mode', (mode) => {
            if (mode === 'AI_TRAIN') {
                this.container.classList.remove('hidden');
            } else {
                this.container.classList.add('hidden');
            }
        });

        events.on('game_over', (data) => {
            this.stats.episodes++;
            this.stats.bestScore = Math.max(this.stats.bestScore, data.score);

            this.scoreHistory.push(data.score);
            if (this.scoreHistory.length > 10) this.scoreHistory.shift();

            this.stats.avgScore = (this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length).toFixed(1);

            this.updateUI();
        });

        events.on('ai_step', (data) => {
            this.stats.epsilon = data.epsilon.toFixed(3);
            this.stats.totalSteps++;
            if (this.stats.totalSteps % 10 === 0) {
                document.getElementById('statEpsilon').textContent = this.stats.epsilon;
            }
        });

        document.getElementById('saveModelBtn').addEventListener('click', () => {
            events.emit('request_save_model');
        });

        document.getElementById('loadModelBtn').addEventListener('click', () => {
            events.emit('request_load_model');
        });
    }

    updateUI() {
        document.getElementById('statEpisodes').textContent = this.stats.episodes;
        document.getElementById('statBest').textContent = this.stats.bestScore;
        document.getElementById('statAvg').textContent = this.stats.avgScore;
        document.getElementById('statEpsilon').textContent = this.stats.epsilon;
    }
}
