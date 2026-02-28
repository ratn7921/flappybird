/**
 * Asset Loader utility to handle preloading of resources
 */
export class AssetLoader {
    constructor() {
        this.images = new Map();
        this.sounds = new Map();
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    async loadImages(imagesObj) {
        const promises = [];

        const traverse = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && (obj[key].endsWith('.png') || obj[key].endsWith('.jpg'))) {
                    promises.push(this.loadImage(key, obj[key]));
                } else if (Array.isArray(obj[key])) {
                    obj[key].forEach((src, index) => {
                        promises.push(this.loadImage(`${key}_${index}`, src));
                    });
                } else if (typeof obj[key] === 'object') {
                    traverse(obj[key]);
                }
            }
        };

        traverse(imagesObj);
        return Promise.all(promises);
    }

    loadImage(key, src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                this.loadedAssets++;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    async loadSounds(soundsObj) {
        const promises = [];
        for (const key in soundsObj) {
            promises.push(this.loadSound(key, soundsObj[key]));
        }
        return Promise.all(promises);
    }

    loadSound(key, src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.sounds.set(key, audio);
                this.loadedAssets++;
                resolve(audio);
            };
            audio.onerror = () => reject(new Error(`Failed to load sound: ${src}`));
            audio.src = src;
        });
    }

    getImage(key) {
        return this.images.get(key);
    }

    getSound(key) {
        return this.sounds.get(key);
    }

    getProgress() {
        return this.totalAssets === 0 ? 1 : this.loadedAssets / this.totalAssets;
    }
}
