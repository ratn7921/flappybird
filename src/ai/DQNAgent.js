import { Agent } from './Agent.js';
import { ReplayBuffer } from './ReplayBuffer.js';
import { CONFIG } from '../core/Config.js';

/**
 * Deep Q-Network Agent
 */
export class DQNAgent extends Agent {
    constructor() {
        super();
        this.stateSize = CONFIG.AI.STATE_SIZE;
        this.actionSize = CONFIG.AI.ACTION_SIZE;
        this.memory = new ReplayBuffer(CONFIG.AI.REPLAY_BUFFER_SIZE);

        this.gamma = CONFIG.AI.GAMMA;
        this.epsilon = CONFIG.AI.EPSILON_START;
        this.epsilonMin = CONFIG.AI.EPSILON_END;
        this.epsilonDecay = CONFIG.AI.EPSILON_DECAY;
        this.learningRate = CONFIG.AI.LEARNING_RATE;

        this.model = this.createModel();
        this.targetModel = this.createModel();
        this.updateTargetModel();

        this.steps = 0;
        this.isTraining = false;
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 24, activation: 'relu', inputShape: [this.stateSize] }));
        model.add(tf.layers.dense({ units: 24, activation: 'relu' }));
        model.add(tf.layers.dense({ units: this.actionSize, activation: 'linear' }));

        model.compile({
            optimizer: tf.train.adam(this.learningRate),
            loss: 'meanSquaredError'
        });
        return model;
    }

    updateTargetModel() {
        this.targetModel.setWeights(this.model.getWeights());
    }

    /**
     * Epsilon-greedy action selection
     */
    predict(state) {
        if (Math.random() <= this.epsilon) {
            return Math.floor(Math.random() * this.actionSize);
        }

        return tf.tidy(() => {
            const stateTensor = tf.tensor2d([this.stateToArray(state)]);
            const prediction = this.model.predict(stateTensor);
            return prediction.argMax(1).dataSync()[0];
        });
    }

    stateToArray(state) {
        return [
            state.birdY,
            state.birdVel,
            state.pipeX,
            state.pipeGapTop,
            state.pipeGapBottom
        ];
    }

    learn(state, action, reward, nextState, done) {
        this.memory.push(
            this.stateToArray(state),
            action,
            reward,
            this.stateToArray(nextState),
            done
        );

        this.steps++;
        if (this.steps % CONFIG.AI.TARGET_UPDATE_FREQ === 0) {
            this.updateTargetModel();
        }

        if (this.memory.length < CONFIG.AI.BATCH_SIZE || this.isTraining) return;

        this.trainBatch();

        // Decay epsilon
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    async trainBatch() {
        this.isTraining = true;
        const batchSize = CONFIG.AI.BATCH_SIZE;
        const batch = this.memory.sample(batchSize);

        const states = batch.map(e => e.state);
        const nextStates = batch.map(e => e.nextState);

        const stateTensor = tf.tensor2d(states);
        const nextStateTensor = tf.tensor2d(nextStates);

        const qValues = this.model.predict(stateTensor);
        const nextQValues = this.targetModel.predict(nextStateTensor);

        const qs = await qValues.array();
        const nextQs = await nextQValues.array();

        for (let i = 0; i < batchSize; i++) {
            const { action, reward, done } = batch[i];
            let target = reward;
            if (!done) {
                target = reward + this.gamma * Math.max(...nextQs[i]);
            }
            qs[i][action] = target;
        }

        const targetTensor = tf.tensor2d(qs);
        const history = await this.model.fit(stateTensor, targetTensor, {
            epochs: 1,
            verbose: 0
        });

        tf.dispose([stateTensor, nextStateTensor, qValues, nextQValues, targetTensor]);

        this.isTraining = false;
        return history.history.loss[0];
    }

    async save() {
        await super.save(CONFIG.STORAGE.MODEL_PATH);
        console.log("Model saved to LocalStorage");
    }

    async load() {
        try {
            const loadedModel = await tf.loadLayersModel(CONFIG.STORAGE.MODEL_PATH);
            this.model.setWeights(loadedModel.getWeights());
            this.updateTargetModel();
            console.log("Model loaded from LocalStorage");
            return true;
        } catch (e) {
            console.warn("No saved model found or load failed", e);
            return false;
        }
    }
}
