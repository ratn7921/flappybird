/**
 * Base Agent class for AI
 */
export class Agent {
    constructor() {
        this.model = null;
    }

    /**
     * Given a state, predict the next action
     * @param {Object} state 
     * @returns {number} 0 (idle) or 1 (flap)
     */
    predict(state) {
        throw new Error("predict() must be implemented by subclass");
    }

    /**
     * Learn from experience
     */
    learn(state, action, reward, nextState, done) {
        // Base implementation does nothing
    }

    async save(location) {
        if (this.model) {
            await this.model.save(location);
        }
    }

    async load(location) {
        // To be implemented with TF.js
    }
}
