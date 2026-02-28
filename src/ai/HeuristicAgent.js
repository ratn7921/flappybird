import { Agent } from './Agent.js';

/**
 * Heuristic Agent to demonstrate AI mode without heavy ML libraries initially.
 * This pilot uses vertical logic to maintain altitude between pipe gaps.
 */
export class HeuristicAgent extends Agent {
    predict(state) {
        // Simple logic: if bird is below the gap center, flap
        const gapCenter = (state.pipeGapTop + state.pipeGapBottom) / 2;

        // Add a bit of buffer to avoid over-flapping
        if (state.birdY > gapCenter + 0.05) {
            return 1; // FLAP
        }
        return 0; // IDLE
    }
}
