import { Entity } from './Entity.js';
import { CONFIG } from '../core/Config.js';

export class Ground extends Entity {
    constructor() {
        super(0, CONFIG.CANVAS.LOGICAL_HEIGHT - CONFIG.PHYSICS.GROUND_Y_OFFSET, CONFIG.CANVAS.LOGICAL_WIDTH, CONFIG.PHYSICS.GROUND_Y_OFFSET);
        this.offset = 0;
    }

    update(dt) {
        this.offset = (this.offset + CONFIG.PIPE.SPEED) % CONFIG.CANVAS.LOGICAL_WIDTH;
    }

    draw(ctx, groundSprite) {
        ctx.drawImage(groundSprite, -this.offset, this.y, this.width, this.height);
        ctx.drawImage(groundSprite, this.width - this.offset, this.y, this.width, this.height);
    }
}
