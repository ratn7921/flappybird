import { Entity } from './Entity.js';
import { CONFIG } from '../core/Config.js';

export class Pipe extends Entity {
    constructor(x, topHeight) {
        super(x, 0, CONFIG.PIPE.WIDTH, CONFIG.CANVAS.LOGICAL_HEIGHT);
        this.topHeight = topHeight;
        this.gap = CONFIG.PIPE.GAP;
        this.passed = false;
    }

    update(dt) {
        this.x -= CONFIG.PIPE.SPEED;
        if (this.x + this.width < 0) {
            this.isActive = false;
        }
    }

    draw(ctx, pipeSprite) {
        // Top pipe (inverted)
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.topHeight);
        ctx.scale(1, -1);
        ctx.drawImage(pipeSprite, -this.width / 2, 0, this.width, CONFIG.CANVAS.LOGICAL_HEIGHT);
        ctx.restore();

        // Bottom pipe
        ctx.drawImage(
            pipeSprite,
            this.x,
            this.topHeight + this.gap,
            this.width,
            CONFIG.CANVAS.LOGICAL_HEIGHT
        );
    }
}
