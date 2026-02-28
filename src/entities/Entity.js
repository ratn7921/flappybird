import { CONFIG } from '../core/Config.js';

/**
 * Base Entity class
 */
export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isActive = true;
    }

    update(dt) {
        // To be implemented by subclasses
    }

    draw(ctx) {
        // To be implemented by subclasses
    }
}
