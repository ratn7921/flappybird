/**
 * Game Configuration Constants
 * Modular approach to avoid "magic numbers"
 */
export const CONFIG = {
    CANVAS: {
        LOGICAL_WIDTH: 288,
        LOGICAL_HEIGHT: 512,
        BASE_WIDTH: 480, // Max display width
    },
    PHYSICS: {
        GRAVITY: 0.25,
        TERMINAL_VELOCITY: 8,
        JUMP_FORCE: -4.8,
        GROUND_Y_OFFSET: 112,
    },
    BIRD: {
        WIDTH: 34,
        HEIGHT: 24,
        START_X_RATIO: 0.2,
        START_Y_RATIO: 0.4,
        ROTATION_UP: -25,
        ROTATION_DOWN: 90,
        ROTATION_SPEED: 0.15,
        WING_ANIM_SPEED: 0.2,
    },
    PIPE: {
        WIDTH: 52,
        GAP: 110,
        SPAWN_RATE: 1500, // ms
        SPEED: 2.2,
        MIN_TOP: 50,
        MAX_TOP_OFFSET: 150,
    },
    ASSETS: {
        IMAGES: {
            BIRD: [
                'images/bird1.png',
                'images/bird2.png',
                'images/bird3.png'
            ],
            BG_DAY: 'images/daybg.png',
            BG_NIGHT: 'images/nightbg.png',
            PIPE: 'images/pipe.png',
            GROUND: 'images/ground.png',
        },
        AUDIO: {
            FLAP: 'audio/flap.mp3',
            HIT: 'audio/hit.mp3',
            SCORE: 'audio/score.mp3',
        }
    },
    STORAGE: {
        HIGH_SCORE_KEY: 'flappy_high_score_v2',
        MODEL_PATH: 'localstorage://flappy-dqn-v1'
    },
    AI: {
        STATE_SIZE: 5,      // birdY, birdVel, pipeX, pipeGapTop, pipeGapBottom
        ACTION_SIZE: 2,     // 0 = IDLE, 1 = FLAP
        LEARNING_RATE: 0.001,
        GAMMA: 0.99,        // Discount factor
        EPSILON_START: 1.0,
        EPSILON_END: 0.01,
        EPSILON_DECAY: 0.995,
        REPLAY_BUFFER_SIZE: 10000,
        BATCH_SIZE: 32,
        TARGET_UPDATE_FREQ: 1000, // Update target network every 1000 steps
    }
};
