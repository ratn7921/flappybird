import { Entity } from './Entity.js';
import { CONFIG } from '../core/Config.js';

export class Bird extends Entity {
    constructor() {
        super(
            CONFIG.CANVAS.LOGICAL_WIDTH * CONFIG.BIRD.START_X_RATIO,
            CONFIG.CANVAS.LOGICAL_HEIGHT * CONFIG.BIRD.START_Y_RATIO,
            CONFIG.BIRD.WIDTH,
            CONFIG.BIRD.HEIGHT
        );
        this.velocity = 0;
        this.rotation = 0;
        this.birdType = 0; // Default to first bird
    }

    reset() {
        this.x = CONFIG.CANVAS.LOGICAL_WIDTH * CONFIG.BIRD.START_X_RATIO;
        this.y = CONFIG.CANVAS.LOGICAL_HEIGHT * CONFIG.BIRD.START_Y_RATIO;
        this.velocity = 0;
        this.rotation = 0;
    }

    flap() {
        this.velocity = CONFIG.PHYSICS.JUMP_FORCE;
    }

    update(dt) {
        // Physics update
        this.velocity += CONFIG.PHYSICS.GRAVITY;
        this.velocity = Math.min(this.velocity, CONFIG.PHYSICS.TERMINAL_VELOCITY);
        this.y += this.velocity;

        // Rotation logic
        const targetRotation = this.velocity < 2
            ? (CONFIG.BIRD.ROTATION_UP * Math.PI / 180)
            : (CONFIG.BIRD.ROTATION_DOWN * Math.PI / 180);

        this.rotation += (targetRotation - this.rotation) * CONFIG.BIRD.ROTATION_SPEED;
    }

    draw(ctx, assets) {
        const sprite = assets.getImage(`BIRD_${this.birdType}`);

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}
