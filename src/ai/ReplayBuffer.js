/**
 * Replay Buffer for storing and sampling experiences
 */
export class ReplayBuffer {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.buffer = [];
        this.position = 0;
    }

    /**
     * Store an experience
     */
    push(state, action, reward, nextState, done) {
        if (this.buffer.length < this.maxSize) {
            this.buffer.push({ state, action, reward, nextState, done });
        } else {
            this.buffer[this.position] = { state, action, reward, nextState, done };
            this.position = (this.position + 1) % this.maxSize;
        }
    }

    /**
     * Sample a batch of experiences
     */
    sample(batchSize) {
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            const index = Math.floor(Math.random() * this.buffer.length);
            batch.push(this.buffer[index]);
        }
        return batch;
    }

    get length() {
        return this.buffer.length;
    }
}
