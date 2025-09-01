// // // (() => {
// // //   "use strict";

// // //   /**
// // //    * Advanced Flappy Bird core — DSA driven, deterministic, and ready for AI integration.
// // //    *
// // //    * Notes:
// // //    *  - Put <canvas id="gameCanvas" width="400" height="600"></canvas> in your HTML.
// // //    *  - This file focuses on game logic, data structures, determinism, and performance.
// // //    *  - For visuals (sprites/sounds), attach separate resources and call into API hooks.
// // //    */ 

// // //   /* =======================
// // //      Utilities & Config
// // //      ======================= */
// // //   const CONFIG = {
// // //     CANVAS_W: 400,
// // //     CANVAS_H: 600,
// // //     BIRD_RADIUS: 12,
// // //     BIRD_START_X: 80,
// // //     BIRD_START_Y: 200,
// // //     GRAVITY: 900,        // px / s^2
// // //     FLAP_IMPULSE: -320,  // px / s (upward)
// // //     PIPE_WIDTH: 64,
// // //     PIPE_GAP_MIN: 120,
// // //     PIPE_GAP_MAX: 170,
// // //     PIPE_INITIAL_SPEED: 160, // px / s
// // //     PIPE_SPEED_SCALE: 1.02,  // speed multiplier per X score or time
// // //     PIPE_SPAWN_INTERVAL: 1.25, // seconds
// // //     MAX_LEADERBOARD: 10,
// // //     SPATIAL_CELL: 80,    // cell size for spatial hash
// // //     SIM_DT: 1 / 60,      // sim dt for simulate()
// // //     RNG_SEED: 123456789, // default seed
// // //     DEBUG: false
// // //   };

// // //   function logDebug(...args) {
// // //     if (CONFIG.DEBUG) console.log("[DBG]", ...args);
// // //   }

// // //   /* =======================
// // //      Deterministic RNG (LCG)
// // //      Good for reproducable training episodes.
// // //      ======================= */
// // //   class LCG {
// // //     constructor(seed = CONFIG.RNG_SEED) {
// // //       this._m = 0x80000000; // 2**31
// // //       this._a = 1103515245;
// // //       this._c = 12345;
// // //       this._state = seed >>> 0;
// // //     }
// // //     nextInt() {
// // //       this._state = (this._a * this._state + this._c) % this._m;
// // //       return this._state;
// // //     }
// // //     nextFloat() {
// // //       // [0,1)
// // //       return this.nextInt() / this._m;
// // //     }
// // //     nextRange(min, max) {
// // //       return min + this.nextFloat() * (max - min);
// // //     }
// // //     clone() {
// // //       const c = new LCG(0);
// // //       c._m = this._m; c._a = this._a; c._c = this._c; c._state = this._state;
// // //       return c;
// // //     }
// // //   }

// // //   /* =======================
// // //      Doubly Linked List (Deque)
// // //      O(1) push/pop at both ends — used for active pipes
// // //      ======================= */
// // //   class DequeNode {
// // //     constructor(value) {
// // //       this.val = value;
// // //       this.prev = null;
// // //       this.next = null;
// // //     }
// // //   }
// // //   class Deque {
// // //     constructor() {
// // //       this.head = null;
// // //       this.tail = null;
// // //       this._size = 0;
// // //     }
// // //     pushBack(val) {
// // //       const node = new DequeNode(val);
// // //       if (!this.tail) {
// // //         this.head = this.tail = node;
// // //       } else {
// // //         node.prev = this.tail;
// // //         this.tail.next = node;
// // //         this.tail = node;
// // //       }
// // //       this._size++;
// // //       return node;
// // //     }
// // //     popFront() {
// // //       if (!this.head) return null;
// // //       const node = this.head;
// // //       this.head = node.next;
// // //       if (this.head) this.head.prev = null;
// // //       else this.tail = null;
// // //       node.next = node.prev = null;
// // //       this._size--;
// // //       return node.val;
// // //     }
// // //     peekFront() {
// // //       return this.head ? this.head.val : null;
// // //     }
// // //     peekBack() {
// // //       return this.tail ? this.tail.val : null;
// // //     }
// // //     forEach(fn) {
// // //       let cur = this.head;
// // //       while (cur) {
// // //         fn(cur.val);
// // //         cur = cur.next;
// // //       }
// // //     }
// // //     toArray() {
// // //       const arr = [];
// // //       this.forEach(v => arr.push(v));
// // //       return arr;
// // //     }
// // //     size() { return this._size; }
// // //     clear() { this.head = this.tail = null; this._size = 0; }
// // //   }

// // //   /* =======================
// // //      Generic MinHeap / Priority Queue
// // //      comparator: (a,b) => a.key - b.key default
// // //      Used for scheduled events and top-score maintenance.
// // //      ======================= */
// // //   class MinHeap {
// // //     constructor(comparator = (a, b) => a.key - b.key) {
// // //       this.data = [];
// // //       this.cmp = comparator;
// // //     }
// // //     size() { return this.data.length; }
// // //     isEmpty() { return this.data.length === 0; }
// // //     peek() { return this.data[0]; }
// // //     push(item) {
// // //       this.data.push(item);
// // //       this._bubbleUp(this.data.length - 1);
// // //     }
// // //     pop() {
// // //       if (this.data.length === 0) return undefined;
// // //       const res = this.data[0];
// // //       const end = this.data.pop();
// // //       if (this.data.length > 0) {
// // //         this.data[0] = end;
// // //         this._sinkDown(0);
// // //       }
// // //       return res;
// // //     }
// // //     _bubbleUp(idx) {
// // //       const data = this.data, cmp = this.cmp;
// // //       while (idx > 0) {
// // //         const parent = Math.floor((idx - 1) / 2);
// // //         if (cmp(data[idx], data[parent]) >= 0) break;
// // //         [data[parent], data[idx]] = [data[idx], data[parent]];
// // //         idx = parent;
// // //       }
// // //     }
// // //     _sinkDown(idx) {
// // //       const data = this.data, cmp = this.cmp;
// // //       const len = data.length;
// // //       while (true) {
// // //         let left = 2 * idx + 1, right = left + 1, swap = null;
// // //         if (left < len) {
// // //           if (cmp(data[left], data[idx]) < 0) swap = left;
// // //         }
// // //         if (right < len) {
// // //           if ((swap === null && cmp(data[right], data[idx]) < 0) ||
// // //               (swap !== null && cmp(data[right], data[left]) < 0)) {
// // //             swap = right;
// // //           }
// // //         }
// // //         if (swap === null) break;
// // //         [data[idx], data[swap]] = [data[swap], data[idx]];
// // //         idx = swap;
// // //       }
// // //     }
// // //   }

// // //   /* =======================
// // //      Spatial Hash (Uniform grid) for collision optimization
// // //      ======================= */
// // //   class SpatialHash {
// // //     constructor(cellSize = CONFIG.SPATIAL_CELL) {
// // //       this.cellSize = cellSize;
// // //       this._map = new Map(); // key -> Set(objects)
// // //     }
// // //     _cellKey(cx, cy) { return `${cx},${cy}`; }
// // //     _cellsForRect(x, y, w, h) {
// // //       const minx = Math.floor(x / this.cellSize);
// // //       const maxx = Math.floor((x + w) / this.cellSize);
// // //       const miny = Math.floor(y / this.cellSize);
// // //       const maxy = Math.floor((y + h) / this.cellSize);
// // //       const res = [];
// // //       for (let i = minx; i <= maxx; i++) {
// // //         for (let j = miny; j <= maxy; j++) res.push([i, j]);
// // //       }
// // //       return res;
// // //     }
// // //     insert(obj, bounds) {
// // //       // bounds: {x,y,w,h}
// // //       const cells = this._cellsForRect(bounds.x, bounds.y, bounds.w, bounds.h);
// // //       obj._spatialCells = cells;
// // //       for (const [cx, cy] of cells) {
// // //         const key = this._cellKey(cx, cy);
// // //         if (!this._map.has(key)) this._map.set(key, new Set());
// // //         this._map.get(key).add(obj);
// // //       }
// // //     }
// // //     remove(obj) {
// // //       if (!obj._spatialCells) return;
// // //       for (const [cx, cy] of obj._spatialCells) {
// // //         const key = this._cellKey(cx, cy);
// // //         const s = this._map.get(key);
// // //         if (s) {
// // //           s.delete(obj);
// // //           if (s.size === 0) this._map.delete(key);
// // //         }
// // //       }
// // //       delete obj._spatialCells;
// // //     }
// // //     update(obj, bounds) {
// // //       this.remove(obj);
// // //       this.insert(obj, bounds);
// // //     }
// // //     query(bounds) {
// // //       const cells = this._cellsForRect(bounds.x, bounds.y, bounds.w, bounds.h);
// // //       const results = new Set();
// // //       for (const [cx, cy] of cells) {
// // //         const key = this._cellKey(cx, cy);
// // //         const s = this._map.get(key);
// // //         if (s) for (const o of s) results.add(o);
// // //       }
// // //       return Array.from(results);
// // //     }
// // //     clear() { this._map.clear(); }
// // //   }

// // //   /* =======================
// // //      Collision helpers
// // //      ======================= */
// // //   function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
// // //     const nx = Math.max(rx, Math.min(cx, rx + rw));
// // //     const ny = Math.max(ry, Math.min(cy, ry + rh));
// // //     const dx = cx - nx;
// // //     const dy = cy - ny;
// // //     return (dx * dx + dy * dy) <= cr * cr;
// // //   }

// // //   /* =======================
// // //      Leaderboard (MinHeap maintaining top-K)
// // //      ======================= */
// // //   class TopK {
// // //     constructor(k = CONFIG.MAX_LEADERBOARD) {
// // //       this.k = k;
// // //       // min-heap keyed by score
// // //       this.heap = new MinHeap((a,b) => a.score - b.score);
// // //     }
// // //     add(score, meta = {}) {
// // //       if (this.heap.size() < this.k) {
// // //         this.heap.push({ score, meta });
// // //       } else if (score > this.heap.peek().score) {
// // //         this.heap.pop();
// // //         this.heap.push({ score, meta });
// // //       }
// // //     }
// // //     toArrayDescending() {
// // //       // extract copy
// // //       const arr = this.heap.data.slice().map(x => ({...x}));
// // //       arr.sort((a,b) => b.score - a.score);
// // //       return arr;
// // //     }
// // //   }

// // //   /* =======================
// // //      Event Scheduler (time-based) using MinHeap
// // //      Each event = { key: time, id, action }
// // //      ======================= */
// // //   class Scheduler {
// // //     constructor() {
// // //       this.heap = new MinHeap((a,b) => a.time - b.time);
// // //       this._idCounter = 0;
// // //     }
// // //     schedule(timeFromNow, action) {
// // //       const t = Date.now() / 1000 + timeFromNow;
// // //       const id = ++this._idCounter;
// // //       this.heap.push({ time: t, id, action });
// // //       return id;
// // //     }
// // //     runReady() {
// // //       const now = Date.now() / 1000;
// // //       while (!this.heap.isEmpty() && this.heap.peek().time <= now) {
// // //         const ev = this.heap.pop();
// // //         try { ev.action(); } catch (e) { console.error("Scheduled action error", e); }
// // //       }
// // //     }
// // //     clear() { this.heap = new MinHeap((a,b) => a.time - b.time); }
// // //   }

// // //   /* =======================
// // //      Pipe Object + PipeManager (using Deque)
// // //      ======================= */
// // //   class Pipe {
// // //     constructor(x, top, gap, width = CONFIG.PIPE_WIDTH) {
// // //       this.x = x;
// // //       this.top = top;
// // //       this.gap = gap;
// // //       this.width = width;
// // //       this.passed = false;
// // //       this._id = Math.random().toString(36).slice(2,9);
// // //     }
// // //     bottom() { return CONFIG.CANVAS_H - (this.top + this.gap); }
// // //     bounds() {
// // //       // returns bounding boxes for spatial indexing (cover entire pipe pair)
// // //       return {
// // //         x: this.x - 2,
// // //         y: 0,
// // //         w: this.width + 4,
// // //         h: CONFIG.CANVAS_H
// // //       };
// // //     }
// // //   }

// // //   class PipeManager {
// // //     constructor(rng) {
// // //       this.deque = new Deque(); // active pipes
// // //       this.rng = rng || new LCG();
// // //       this.speed = CONFIG.PIPE_INITIAL_SPEED;
// // //       this.spawnTimer = 0;
// // //       this.spawnInterval = CONFIG.PIPE_SPAWN_INTERVAL;
// // //       this._nextId = 1;
// // //       this._cachedArray = null; // for occasional binary-search needs
// // //     }
// // //     tick(dt, stateScore) {
// // //       // difficulty scaling with score (linear or exponential)
// // //       if (stateScore > 0 && stateScore % 10 === 0) {
// // //         // gently increase speed
// // //         this.speed *= Math.pow(CONFIG.PIPE_SPEED_SCALE, dt);
// // //       }
// // //       // move pipes
// // //       this.deque.forEach(pipe => {
// // //         pipe.x -= this.speed * dt;
// // //       });
// // //       // spawn logic (time-based)
// // //       this.spawnTimer += dt;
// // //       if (this.spawnTimer >= this.spawnInterval) {
// // //         this.spawnTimer -= this.spawnInterval;
// // //         const gap = CONFIG.PIPE_GAP_MIN + Math.floor(this.rng.nextRange(0, CONFIG.PIPE_GAP_MAX - CONFIG.PIPE_GAP_MIN));
// // //         const topMin = 40;
// // //         const topMax = CONFIG.CANVAS_H - gap - 120;
// // //         const top = Math.floor(this.rng.nextRange(topMin, Math.max(topMin+1, topMax)));
// // //         const p = new Pipe(CONFIG.CANVAS_W + 20, top, gap);
// // //         this.deque.pushBack(p);
// // //         this._cachedArray = null;
// // //       }
// // //       // remove off-screen pipes
// // //       while (this.deque.peekFront() && (this.deque.peekFront().x + this.deque.peekFront().width) < -50) {
// // //         this.deque.popFront();
// // //         this._cachedArray = null;
// // //       }
// // //     }
// // //     forEach(fn) { this.deque.forEach(fn); }
// // //     activeArray() {
// // //       if (this._cachedArray) return this._cachedArray;
// // //       this._cachedArray = this.deque.toArray();
// // //       return this._cachedArray;
// // //     }
// // //     findNextPipeIndex(birdX) {
// // //       // Binary search on sorted x array to find next pipe by x
// // //       const arr = this.activeArray();
// // //       let lo = 0, hi = arr.length - 1, ans = -1;
// // //       while (lo <= hi) {
// // //         const mid = (lo + hi) >> 1;
// // //         if (arr[mid].x + arr[mid].width >= birdX) {
// // //           ans = mid;
// // //           hi = mid - 1;
// // //         } else lo = mid + 1;
// // //       }
// // //       return ans;
// // //     }
// // //     clear() {
// // //       this.deque.clear();
// // //       this._cachedArray = null;
// // //       this.speed = CONFIG.PIPE_INITIAL_SPEED;
// // //       this.spawnTimer = 0;
// // //     }
// // //     snapshot() {
// // //       return this.activeArray().map(p => ({ x: p.x, top: p.top, gap: p.gap, width: p.width }));
// // //     }
// // //   }

// // //   /* =======================
// // //      Bird Class
// // //      ======================= */
// // //   class Bird {
// // //     constructor(x, y, rng) {
// // //       this.x = x; this.y = y;
// // //       this.vy = 0; this.radius = CONFIG.BIRD_RADIUS;
// // //       this.rng = rng || new LCG();
// // //       this.alive = true;
// // //       this.ticks = 0; // used in simulate, etc.
// // //     }
// // //     flap() {
// // //       this.vy = CONFIG.FLAP_IMPULSE;
// // //     }
// // //     applyGravity(dt) {
// // //       this.vy += CONFIG.GRAVITY * dt;
// // //     }
// // //     update(dt) {
// // //       this.applyGravity(dt);
// // //       this.y += this.vy * dt;
// // //       this.ticks++;
// // //       if (this.y + this.radius >= CONFIG.CANVAS_H - 40) {
// // //         this.y = CONFIG.CANVAS_H - 40 - this.radius;
// // //         this.vy = 0;
// // //         this.alive = false;
// // //       }
// // //       if (this.y - this.radius <= 0) {
// // //         this.y = this.radius;
// // //         this.vy = 0;
// // //       }
// // //     }
// // //     bounds() {
// // //       return { x: this.x - this.radius, y: this.y - this.radius, w: this.radius * 2, h: this.radius * 2 };
// // //     }
// // //     snapshot() { return { x: this.x, y: this.y, vy: this.vy, alive: this.alive }; }
// // //     clone() {
// // //       const b = new Bird(this.x, this.y, this.rng.clone());
// // //       b.vy = this.vy; b.radius = this.radius; b.alive = this.alive; b.ticks = this.ticks;
// // //       return b;
// // //     }
// // //   }

// // //   /* =======================
// // //      Simple checksum: FNV-1a (string) — small integrity check for exported state
// // //      ======================= */
// // //   function fnv1a(str) {
// // //     let h = 0x811c9dc5;
// // //     for (let i = 0; i < str.length; i++) {
// // //       h ^= str.charCodeAt(i);
// // //       h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
// // //     }
// // //     return (h >>> 0).toString(16);
// // //   }

// // //   /* =======================
// // //      Game Class — orchestrates everything
// // //      ======================= */
// // //   class Game {
// // //     constructor(canvas) {
// // //       this.canvas = canvas;
// // //       this.ctx = canvas.getContext("2d");
// // //       this.rng = new LCG(Math.floor(Math.random() * 1e9) ^ CONFIG.RNG_SEED);
// // //       this.pipeManager = new PipeManager(this.rng.clone());
// // //       this.bird = new Bird(CONFIG.BIRD_START_X, CONFIG.BIRD_START_Y, this.rng.clone());
// // //       this.spatial = new SpatialHash(CONFIG.SPATIAL_CELL);
// // //       this.scheduler = new Scheduler();
// // //       this.score = 0;
// // //       this.best = this._loadBest();
// // //       this.topk = new TopK(CONFIG.MAX_LEADERBOARD);
// // //       this.lastTimestamp = null;
// // //       this.state = "start"; // 'start', 'playing', 'paused', 'gameover'
// // //       this._accumulator = 0;
// // //       this._targetFPS = 60;
// // //       this._dtTarget = 1 / this._targetFPS;
// // //       this._simMode = false;
// // //       // schedule an initial pipe so first pipe is predictable
// // //       this.scheduler.schedule(0.05, () => { /* trigger nothing, keeps scheduler alive */ });
// // //       this._integrityLast = null;
// // //       this.initInput();
// // //     }

// // //     initInput() {
// // //       window.addEventListener("keydown", (e) => {
// // //         if (e.code === "Space" || e.code === "ArrowUp") {
// // //           if (this.state === "start") this.start();
// // //           if (this.state === "playing") this.bird.flap();
// // //           if (this.state === "gameover") this.reset();
// // //         } else if (e.code === "KeyP") {
// // //           this.togglePause();
// // //         } else if (e.code === "KeyR") {
// // //           this.reset();
// // //         }
// // //       });
// // //       this.canvas.addEventListener("pointerdown", (e) => {
// // //         if (this.state === "start") this.start();
// // //         if (this.state === "playing") this.bird.flap();
// // //         if (this.state === "gameover") this.reset();
// // //       });
// // //     }

// // //     start() {
// // //       if (this.state === "start" || this.state === "paused") {
// // //         this.state = "playing";
// // //         this.lastTimestamp = null;
// // //       }
// // //     }
// // //     togglePause() {
// // //       if (this.state === "playing") this.state = "paused";
// // //       else if (this.state === "paused") this.state = "playing";
// // //     }
// // //     reset(seed = null) {
// // //       if (seed !== null) this.rng = new LCG(seed);
// // //       else this.rng = new LCG(Math.floor(Math.random() * 1e9) ^ CONFIG.RNG_SEED);
// // //       this.pipeManager = new PipeManager(this.rng.clone());
// // //       this.bird = new Bird(CONFIG.BIRD_START_X, CONFIG.BIRD_START_Y, this.rng.clone());
// // //       this.spatial.clear();
// // //       this.scheduler.clear();
// // //       this.score = 0;
// // //       this.state = "start";
// // //       this._integrityLast = null;
// // //       this.lastTimestamp = null;
// // //       this._simMode = false;
// // //       logDebug("Game reset");
// // //     }
// // //     _loadBest() {
// // //       try {
// // //         const v = localStorage.getItem("flappy_best_v2");
// // //         return v ? parseInt(v, 10) : 0;
// // //       } catch (e) {
// // //         return 0;
// // //       }
// // //     }
// // //     _saveBest() {
// // //       try {
// // //         localStorage.setItem("flappy_best_v2", String(this.best));
// // //       } catch (e) {
// // //         // ignore storage errors
// // //       }
// // //     }

// // //     update(dt) {
// // //       if (this.state !== "playing") return;
// // //       // run scheduled events
// // //       this.scheduler.runReady();

// // //       // tick pipe manager
// // //       this.pipeManager.tick(dt, this.score);

// // //       // update spatial index for pipes
// // //       // reinsert all pipes (cheap because objects are few)
// // //       const existing = this.pipeManager.activeArray();
// // //       this.spatial.clear();
// // //       for (const p of existing) {
// // //         this.spatial.insert(p, p.bounds());
// // //       }

// // //       // bird physics
// // //       this.bird.update(dt);

// // //       // collision checks via spatial query
// // //       const birdBounds = this.bird.bounds();
// // //       const candidates = this.spatial.query(birdBounds);
// // //       for (const p of candidates) {
// // //         // check top pipe
// // //         if (circleRectCollide(this.bird.x, this.bird.y, this.bird.radius, p.x, 0, p.width, p.top)) {
// // //           this._onBirdHit();
// // //           break;
// // //         }
// // //         // bottom pipe
// // //         const bottomY = p.top + p.gap;
// // //         if (circleRectCollide(this.bird.x, this.bird.y, this.bird.radius, p.x, bottomY, p.width, CONFIG.CANVAS_H - bottomY - 40)) {
// // //           this._onBirdHit();
// // //           break;
// // //         }
// // //       }

// // //       // scoring: mark pipes passed
// // //       this.pipeManager.forEach(p => {
// // //         if (!p.passed && (p.x + p.width) < this.bird.x) {
// // //           p.passed = true;
// // //           this.score++;
// // //           if (this.score > this.best) { this.best = this.score; this._saveBest(); }
// // //         }
// // //       });
// // //     }

// // //     _onBirdHit() {
// // //       if (this.state === "playing") {
// // //         this.state = "gameover";
// // //         this._onGameOver();
// // //       }
// // //     }

// // //     _onGameOver() {
// // //       this.topk.add(this.score, { date: Date.now() });
// // //       if (this.score > this.best) {
// // //         this.best = this.score;
// // //         this._saveBest();
// // //       }
// // //       logDebug("Game Over. Score:", this.score, "Best:", this.best);
// // //     }

// // //     draw() {
// // //       const ctx = this.ctx;
// // //       ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

// // //       // background gradient
// // //       const g = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_H);
// // //       g.addColorStop(0, "#9be7ff"); g.addColorStop(1, "#64b5f6");
// // //       ctx.fillStyle = g;
// // //       ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

// // //       // pipes
// // //       this.pipeManager.forEach(p => {
// // //         // top
// // //         ctx.fillStyle = "#16a34a";
// // //         ctx.fillRect(p.x, 0, p.width, p.top);
// // //         // rim
// // //         ctx.fillStyle = "#15803d";
// // //         ctx.fillRect(p.x - 6, p.top - 16, p.width + 12, 16);
// // //         // bottom
// // //         ctx.fillStyle = "#16a34a";
// // //         ctx.fillRect(p.x, p.top + p.gap, p.width, CONFIG.CANVAS_H - 40 - (p.top + p.gap));
// // //         // rim bottom
// // //         ctx.fillStyle = "#15803d";
// // //         ctx.fillRect(p.x - 6, p.top + p.gap, p.width + 12, 16);
// // //       });

// // //       // ground
// // //       ctx.fillStyle = "#a0522d";
// // //       ctx.fillRect(0, CONFIG.CANVAS_H - 40, CONFIG.CANVAS_W, 40);

// // //       // bird (circular)
// // //       ctx.beginPath();
// // //       ctx.fillStyle = "#ffcc00";
// // //       ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
// // //       ctx.fill();
// // //       ctx.closePath();
// // //       // eye
// // //       ctx.beginPath();
// // //       ctx.fillStyle = "#111827";
// // //       ctx.arc(this.bird.x + 6, this.bird.y - 4, 3, 0, Math.PI * 2);
// // //       ctx.fill(); ctx.closePath();

// // //       // HUD
// // //       ctx.fillStyle = "rgba(0,0,0,0.35)";
// // //       ctx.fillRect(8, 8, 120, 44);
// // //       ctx.fillStyle = "#fff";
// // //       ctx.font = "18px system-ui, Arial";
// // //       ctx.fillText("Score: " + this.score, 14, 30);
// // //       ctx.fillText("Best: " + this.best, 14, 48);

// // //       if (this.state === "start") {
// // //         ctx.fillStyle = "rgba(0,0,0,0.5)";
// // //         ctx.fillRect(0, CONFIG.CANVAS_H/2 - 60, CONFIG.CANVAS_W, 120);
// // //         ctx.fillStyle = "#fff";
// // //         ctx.font = "24px system-ui, Arial";
// // //         ctx.textAlign = "center";
// // //         ctx.fillText("Press Space / Click to start", CONFIG.CANVAS_W/2, CONFIG.CANVAS_H/2);
// // //         ctx.textAlign = "start";
// // //       } else if (this.state === "gameover") {
// // //         ctx.fillStyle = "rgba(0,0,0,0.6)";
// // //         ctx.fillRect(0, CONFIG.CANVAS_H/2 - 80, CONFIG.CANVAS_W, 160);
// // //         ctx.fillStyle = "#fff";
// // //         ctx.font = "28px system-ui, Arial";
// // //         ctx.textAlign = "center";
// // //         ctx.fillText("Game Over", CONFIG.CANVAS_W/2, CONFIG.CANVAS_H/2 - 10);
// // //         ctx.font = "18px system-ui, Arial";
// // //         ctx.fillText(`Score: ${this.score} — Press R to restart`, CONFIG.CANVAS_W/2, CONFIG.CANVAS_H/2 + 30);
// // //         ctx.textAlign = "start";
// // //       }
// // //     }

// // //     frameStep(ts) {
// // //       if (!this.lastTimestamp) this.lastTimestamp = ts;
// // //       const elapsed = (ts - this.lastTimestamp) / 1000;
// // //       // clamp a sensible max delta (prevents jump when switching tabs)
// // //       const dt = Math.min(0.05, elapsed);
// // //       this.lastTimestamp = ts;
// // //       if (this.state === "playing") {
// // //         this.update(dt);
// // //       }
// // //       this.draw();

// // //       // integrity update
// // //       this._integrityLast = this.computeIntegrity();

// // //       // continue loop
// // //       requestAnimationFrame(t => this.frameStep(t));
// // //     }

// // //     run() {
// // //       requestAnimationFrame(t => this.frameStep(t));
// // //     }

// // //     /* -----------------------
// // //        API for AI / external systems
// // //        ----------------------- */

// // //     exportState() {
// // //       // minimal immutable snapshot for AIs
// // //       const pipes = this.pipeManager.snapshot();
// // //       const bird = this.bird.snapshot();
// // //       const state = {
// // //         bird,
// // //         pipes,
// // //         score: this.score,
// // //         best: this.best,
// // //         ts: Date.now()
// // //       };
// // //       // produce checksum
// // //       const s = JSON.stringify(state);
// // //       const hash = fnv1a(s);
// // //       return { state, hash };
// // //     }

// // //     computeIntegrity() {
// // //       try {
// // //         const { state, hash } = this.exportState();
// // //         return hash;
// // //       } catch (e) {
// // //         return null;
// // //       }
// // //     }

// // //     simulateAction(action, steps = 60, seed = null) {
// // //       // deterministic simulate for testing AI decisions:
// // //       // action: function(bird, pipes, t) => e.g. flap decision boolean
// // //       // steps: number of frames to simulate at SIM_DT
// // //       // seed: optional RNG seed for reproducibility
// // //       const snapshotRng = seed ? new LCG(seed) : this.rng.clone();
// // //       // clone components to not affect live game
// // //       const simBird = this.bird.clone();
// // //       const simPipeManager = new PipeManager(snapshotRng.clone());
// // //       // copy pipes
// // //       for (const p of this.pipeManager.activeArray()) {
// // //         const pcopy = new Pipe(p.x, p.top, p.gap, p.width);
// // //         pcopy.passed = p.passed;
// // //         simPipeManager.deque.pushBack(pcopy);
// // //       }
// // //       simPipeManager.speed = this.pipeManager.speed;
// // //       const simScore = this.score;
// // //       for (let i = 0; i < steps; i++) {
// // //         // action decision
// // //         const doFlap = !!action({
// // //           bird: { x: simBird.x, y: simBird.y, vy: simBird.vy, radius: simBird.radius },
// // //           pipes: simPipeManager.activeArray().map(x => ({ x: x.x, top: x.top, gap: x.gap, width: x.width })),
// // //           step: i,
// // //           rng: snapshotRng
// // //         });
// // //         if (doFlap) simBird.flap();
// // //         simBird.update(CONFIG.SIM_DT);
// // //         simPipeManager.tick(CONFIG.SIM_DT, simScore);
// // //         // simple collision check (non-spatial for simplicity)
// // //         for (const p of simPipeManager.activeArray()) {
// // //           if (circleRectCollide(simBird.x, simBird.y, simBird.radius, p.x, 0, p.width, p.top)) {
// // //             return { result: "dead", step: i };
// // //           }
// // //           const by = p.top + p.gap;
// // //           if (circleRectCollide(simBird.x, simBird.y, simBird.radius, p.x, by, p.width, CONFIG.CANVAS_H - by - 40)) {
// // //             return { result: "dead", step: i };
// // //           }
// // //         }
// // //       }
// // //       return { result: "alive", steps };
// // //     }

// // //   } // end Game class

// // //   /* =======================
// // //      Boot
// // //      ======================= */
// // //   const canvas = document.getElementById("gameCanvas");
// // //   if (!canvas) {
// // //     console.error("Canvas #gameCanvas not found. Please add <canvas id='gameCanvas' width='400' height='600'></canvas> in HTML.");
// // //     return;
// // //   }
// // //   // set canonical size to config (helps if CSS scales)
// // //   canvas.width = CONFIG.CANVAS_W;
// // //   canvas.height = CONFIG.CANVAS_H;

// // //   const game = new Game(canvas);
// // //   game.run();

// // //   // expose for console / AI debugging
// // //   window.__FLAPPY_ADV = {
// // //     game,
// // //     getState: () => game.exportState(),
// // //     simulate: (actionFn, steps=60, seed=null) => game.simulateAction(actionFn, steps, seed),
// // //     reset: (seed=null) => game.reset(seed),
// // //     start: () => game.start(),
// // //     pause: () => game.togglePause(),
// // //     integrity: () => game.computeIntegrity()
// // //   };

// // //   console.log("Advanced Flappy core loaded. API: window.__FLAPPY_ADV");
// // // })();



// // // // ==== GAME CONFIGURATION ====
// // // const canvas = document.getElementById("gameCanvas");
// // // const ctx = canvas.getContext("2d");
// // // const scoreElement = document.getElementById("score");
// // // const startBtn = document.getElementById("startBtn");
// // // const resetBtn = document.getElementById("resetBtn");

// // // // Game state
// // // let gameRunning = false;
// // // let score = 0;
// // // let frameCount = 0;

// // // // ==== DSA-style structures ====
// // // class Queue {
// // //   constructor() {
// // //     this.items = [];
// // //   }
// // //   enqueue(element) {
// // //     this.items.push(element);
// // //   }
// // //   dequeue() {
// // //     return this.items.shift();
// // //   }
// // //   front() {
// // //     return this.items[0];
// // //   }
// // //   isEmpty() {
// // //     return this.items.length === 0;
// // //   }
// // // }

// // // class Bird {
// // //   constructor() {
// // //     this.x = 60;
// // //     this.y = canvas.height / 2;
// // //     this.radius = 20;
// // //     this.velocity = 0;
// // //     this.gravity = 0.6;
// // //     this.lift = -10;
// // //   }
// // //   draw() {
// // //     ctx.beginPath();
// // //     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
// // //     ctx.fillStyle = "#FFD700";
// // //     ctx.fill();
// // //     ctx.strokeStyle = "#DAA520";
// // //     ctx.stroke();
// // //     ctx.closePath();
// // //   }
// // //   update() {
// // //     this.velocity += this.gravity;
// // //     this.y += this.velocity;
// // //     if (this.y + this.radius > canvas.height) {
// // //       this.y = canvas.height - this.radius;
// // //       this.velocity = 0;
// // //     }
// // //   }
// // //   flap() {
// // //     this.velocity += this.lift;
// // //   }
// // // }

// // // class Pipe {
// // //   constructor(x) {
// // //     this.x = x;
// // //     this.width = 60;
// // //     this.gap = 150;
// // //     this.top = Math.random() * (canvas.height / 2);
// // //     this.bottom = canvas.height - (this.top + this.gap);
// // //     this.speed = 2.5;
// // //   }
// // //   draw() {
// // //     ctx.fillStyle = "#228B22";
// // //     ctx.fillRect(this.x, 0, this.width, this.top);
// // //     ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
// // //   }
// // //   update() {
// // //     this.x -= this.speed;
// // //   }
// // //   offScreen() {
// // //     return this.x + this.width < 0;
// // //   }
// // //   hits(bird) {
// // //     if (
// // //       bird.y - bird.radius < this.top ||
// // //       bird.y + bird.radius > canvas.height - this.bottom
// // //     ) {
// // //       if (bird.x + bird.radius > this.x && bird.x - bird.radius < this.x + this.width) {
// // //         return true;
// // //       }
// // //     }
// // //     return false;
// // //   }
// // // }

// // // // ==== INIT ====
// // // let bird = new Bird();
// // // let pipes = new Queue();

// // // // ==== GAME LOOP ====
// // // function gameLoop() {
// // //   if (!gameRunning) return;

// // //   ctx.clearRect(0, 0, canvas.width, canvas.height);

// // //   // Bird
// // //   bird.update();
// // //   bird.draw();

// // //   // Pipes
// // //   if (frameCount % 120 === 0) {
// // //     pipes.enqueue(new Pipe(canvas.width));
// // //   }

// // //   let frontPipe = pipes.front();
// // //   pipes.items.forEach((pipe, idx) => {
// // //     pipe.update();
// // //     pipe.draw();

// // //     // Collision detection
// // //     if (pipe.hits(bird)) {
// // //       gameOver();
// // //     }

// // //     // Score logic
// // //     if (!pipe.passed && pipe.x + pipe.width < bird.x) {
// // //       score++;
// // //       scoreElement.textContent = score;
// // //       pipe.passed = true;
// // //     }
// // //   });

// // //   // Remove old pipes
// // //   if (frontPipe && frontPipe.offScreen()) {
// // //     pipes.dequeue();
// // //   }

// // //   frameCount++;
// // //   requestAnimationFrame(gameLoop);
// // // }

// // // // ==== CONTROLS ====
// // // document.addEventListener("keydown", (e) => {
// // //   if (e.code === "Space") bird.flap();
// // // });

// // // canvas.addEventListener("click", () => {
// // //   bird.flap();
// // // });

// // // // ==== GAME FLOW ====
// // // function startGame() {
// // //   gameRunning = true;
// // //   score = 0;
// // //   frameCount = 0;
// // //   bird = new Bird();
// // //   pipes = new Queue();
// // //   scoreElement.textContent = score;
// // //   gameLoop();
// // // }

// // // function resetGame() {
// // //   gameRunning = false;
// // //   ctx.clearRect(0, 0, canvas.width, canvas.height);
// // //   scoreElement.textContent = 0;
// // // }

// // // function gameOver() {
// // //   gameRunning = false;
// // //   ctx.fillStyle = "rgba(0,0,0,0.7)";
// // //   ctx.fillRect(0, 0, canvas.width, canvas.height);
// // //   ctx.fillStyle = "#fff";
// // //   ctx.font = "40px Arial";
// // //   ctx.fillText("Game Over", canvas.width / 4, canvas.height / 2);
// // // }

// // // // ==== BUTTONS ====
// // // startBtn.addEventListener("click", startGame);
// // // resetBtn.addEventListener("click", resetGame);

// // const canvas = document.getElementById("gameCanvas");
// // const ctx = canvas.getContext("2d");

// // let bird, pipes, score, bestScore, gameRunning, gamePaused, gravity, jump, pipeGap, particles;

// // // Images
// // const birdImg = new Image();
// // birdImg.src = "https://i.ibb.co/ZM9WhfK/flappy-bird.png"; // sample bird sprite

// // function resetGame() {
// //   bird = { x: 50, y: 250, w: 34, h: 24, dy: 0 };
// //   pipes = [];
// //   score = 0;
// //   pipeGap = 140;
// //   particles = [];
// //   gameRunning = true;
// //   gamePaused = false;
// // }

// // function drawBird() {
// //   ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);
// // }

// // function drawPipes() {
// //   ctx.fillStyle = "linear-gradient(to bottom, #4caf50, #2e7d32)";
// //   pipes.forEach(pipe => {
// //     ctx.fillStyle = "#2ecc71";
// //     ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
// //     ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.w, pipe.bottom);
// //     ctx.strokeStyle = "#27ae60";
// //     ctx.lineWidth = 3;
// //     ctx.strokeRect(pipe.x, 0, pipe.w, pipe.top);
// //     ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipe.w, pipe.bottom);
// //   });
// // }

// // function drawParticles() {
// //   particles.forEach((p, i) => {
// //     ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
// //     ctx.beginPath();
// //     ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
// //     ctx.fill();
// //     p.x += p.dx;
// //     p.y += p.dy;
// //     p.alpha -= 0.02;
// //     if (p.alpha <= 0) particles.splice(i, 1);
// //   });
// // }

// // function createParticles(x, y) {
// //   for (let i = 0; i < 8; i++) {
// //     particles.push({
// //       x, y,
// //       dx: (Math.random() - 0.5) * 2,
// //       dy: (Math.random() - 0.5) * 2,
// //       size: Math.random() * 3 + 2,
// //       alpha: 1,
// //       color: "255,193,7"
// //     });
// //   }
// // }

// // function gameLoop() {
// //   if (!gameRunning || gamePaused) return;

// //   ctx.clearRect(0, 0, canvas.width, canvas.height);

// //   // Bird physics
// //   bird.dy += gravity;
// //   bird.y += bird.dy;

// //   // Pipes
// //   if (pipes.length === 0 || pipes[pipes.length - 1].x < 250) {
// //     let top = Math.random() * (canvas.height / 2);
// //     let bottom = canvas.height - top - pipeGap;
// //     pipes.push({ x: canvas.width, w: 50, top, bottom });
// //   }
// //   pipes.forEach(pipe => pipe.x -= 2);

// //   // Collision detection
// //   pipes.forEach(pipe => {
// //     if (
// //       bird.x < pipe.x + pipe.w &&
// //       bird.x + bird.w > pipe.x &&
// //       (bird.y < pipe.top || bird.y + bird.h > canvas.height - pipe.bottom)
// //     ) {
// //       gameOver();
// //     }
// //   });

// //   // Off-screen pipes + scoring
// //   pipes = pipes.filter(pipe => {
// //     if (pipe.x + pipe.w < 0) {
// //       score++;
// //       createParticles(bird.x + bird.w, bird.y + bird.h / 2);
// //       pipeGap = Math.max(100, pipeGap - 2); // harder each point
// //       return false;
// //     }
// //     return true;
// //   });

// //   // Draw elements
// //   drawPipes();
// //   drawBird();
// //   drawParticles();

// //   // UI Update
// //   document.getElementById("score").textContent = score;
// //   requestAnimationFrame(gameLoop);
// // }

// // function gameOver() {
// //   gameRunning = false;
// //   document.getElementById("gameOverScreen").classList.remove("hidden");
// //   document.getElementById("finalScore").textContent = score;
// //   bestScore = Math.max(bestScore, score);
// //   localStorage.setItem("bestScore", bestScore);
// //   document.getElementById("finalBest").textContent = bestScore;
// // }

// // function jumpBird() {
// //   bird.dy = jump;
// // }

// // // Event Listeners
// // document.addEventListener("keydown", e => {
// //   if (e.code === "Space") jumpBird();
// // });
// // canvas.addEventListener("click", jumpBird);

// // document.getElementById("playBtn").addEventListener("click", () => {
// //   document.getElementById("landingScreen").classList.add("hidden");
// //   document.getElementById("gameUI").classList.remove("hidden");
// //   resetGame();
// //   gameLoop();
// // });

// // document.getElementById("resetBtn").addEventListener("click", () => {
// //   resetGame();
// //   gameLoop();
// // });

// // document.getElementById("restartBtn").addEventListener("click", () => {
// //   document.getElementById("gameOverScreen").classList.add("hidden");
// //   resetGame();
// //   gameLoop();
// // });

// // document.getElementById("pauseBtn").addEventListener("click", () => {
// //   gamePaused = !gamePaused;
// //   if (!gamePaused) gameLoop();
// // });

// // // Initial setup
// // gravity = 0.4;
// // jump = -7;
// // bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
// // document.getElementById("bestScore").textContent = bestScore;



// // =====================
// // Flappy Bird Advanced Clone
// // With Enhanced Logic, DSA & Features
// // =====================

// // --- Canvas Setup ---
// const canvas = document.getElementById("gameCanvas");
// const ctx = canvas.getContext("2d");

// canvas.width = 480;
// canvas.height = 640;

// // --- Game Variables ---
// let frames = 0;
// let score = 0;
// let highScore = 0;
// let gameOver = false;
// let gameStarted = false;

// // --- Physics ---
// const GRAVITY = 0.25;
// const FLAP = -5;
// const PIPE_GAP = 150;

// // --- Bird Object ---
// class Bird {
//   constructor() {
//     this.x = 50;
//     this.y = canvas.height / 2;
//     this.width = 34;
//     this.height = 24;
//     this.velocity = 0;
//     this.rotation = 0;
//     this.lift = FLAP;
//     this.history = []; // store movement history (linked-list logic)
//   }

//   draw() {
//     ctx.save();
//     ctx.translate(this.x, this.y);
//     ctx.rotate(this.rotation);
//     ctx.fillStyle = "yellow";
//     ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
//     ctx.restore();

//     // Trail effect
//     ctx.fillStyle = "rgba(255,255,0,0.3)";
//     for (let i = 0; i < this.history.length; i++) {
//       let h = this.history[i];
//       ctx.fillRect(h.x, h.y, 3, 3);
//     }
//   }

//   update() {
//     this.velocity += GRAVITY;
//     this.y += this.velocity;

//     // Rotation logic
//     if (this.velocity < 0) {
//       this.rotation = -0.3;
//     } else {
//       this.rotation = Math.min(Math.PI / 2, this.rotation + 0.03);
//     }

//     // Store history (linked-list like behavior)
//     this.history.push({ x: this.x, y: this.y });
//     if (this.history.length > 20) this.history.shift(); // keep last 20 frames
//   }

//   flap() {
//     this.velocity = this.lift;
//   }

//   reset() {
//     this.y = canvas.height / 2;
//     this.velocity = 0;
//     this.history = [];
//   }
// }

// // --- Pipe Object ---
// class Pipe {
//   constructor() {
//     this.top = Math.random() * (canvas.height / 2);
//     this.bottom = this.top + PIPE_GAP;
//     this.x = canvas.width;
//     this.width = 50;
//     this.speed = 2;
//   }

//   draw() {
//     ctx.fillStyle = "#228B22";
//     ctx.fillRect(this.x, 0, this.width, this.top);
//     ctx.fillRect(this.x, this.bottom, this.width, canvas.height - this.bottom);
//   }

//   update() {
//     this.x -= this.speed;
//   }

//   offscreen() {
//     return this.x + this.width < 0;
//   }
// }

// // --- Game Objects ---
// let bird = new Bird();
// let pipes = [];

// // --- Priority Queue for Pipe Timing ---
// class MinHeap {
//   constructor() {
//     this.data = [];
//   }
//   insert(val) {
//     this.data.push(val);
//     this.bubbleUp();
//   }
//   bubbleUp() {
//     let idx = this.data.length - 1;
//     while (idx > 0) {
//       let parent = Math.floor((idx - 1) / 2);
//       if (this.data[idx] >= this.data[parent]) break;
//       [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
//       idx = parent;
//     }
//   }
//   extractMin() {
//     if (this.data.length === 0) return null;
//     const min = this.data[0];
//     const end = this.data.pop();
//     if (this.data.length > 0) {
//       this.data[0] = end;
//       this.sinkDown(0);
//     }
//     return min;
//   }
//   sinkDown(idx) {
//     let left = 2 * idx + 1;
//     let right = 2 * idx + 2;
//     let smallest = idx;
//     if (left < this.data.length && this.data[left] < this.data[smallest]) smallest = left;
//     if (right < this.data.length && this.data[right] < this.data[smallest]) smallest = right;
//     if (smallest !== idx) {
//       [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
//       this.sinkDown(smallest);
//     }
//   }
// }
// let spawnHeap = new MinHeap();
// spawnHeap.insert(100);

// // --- Collision Detection ---
// function checkCollision(bird, pipe) {
//   if (bird.y + bird.height / 2 >= canvas.height || bird.y - bird.height / 2 <= 0) {
//     return true;
//   }
//   if (
//     bird.x + bird.width / 2 > pipe.x &&
//     bird.x - bird.width / 2 < pipe.x + pipe.width &&
//     (bird.y - bird.height / 2 < pipe.top || bird.y + bird.height / 2 > pipe.bottom)
//   ) {
//     return true;
//   }
//   return false;
// }

// // --- Draw Score ---
// function drawScore() {
//   ctx.fillStyle = "white";
//   ctx.font = "24px Arial";
//   ctx.fillText("Score: " + score, 10, 30);
//   ctx.fillText("High Score: " + highScore, 10, 60);
// }

// // --- Reset Game ---
// function resetGame() {
//   bird.reset();
//   pipes = [];
//   score = 0;
//   frames = 0;
//   gameOver = false;
//   gameStarted = false;
//   spawnHeap = new MinHeap();
//   spawnHeap.insert(100);
// }

// // --- Main Update Loop ---
// function update() {
//   if (!gameStarted) {
//     ctx.fillStyle = "rgba(0,0,0,0.7)";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = "white";
//     ctx.font = "30px Arial";
//     ctx.fillText("Press SPACE to Start", 90, canvas.height / 2);
//     return;
//   }

//   frames++;
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Update Bird
//   bird.update();
//   bird.draw();

//   // Spawn pipes using MinHeap priority queue
//   if (frames === spawnHeap.extractMin()) {
//     pipes.push(new Pipe());
//     spawnHeap.insert(frames + Math.floor(Math.random() * 100) + 80);
//   }

//   // Update Pipes
//   for (let i = pipes.length - 1; i >= 0; i--) {
//     pipes[i].update();
//     pipes[i].draw();

//     // Check collision
//     if (checkCollision(bird, pipes[i])) {
//       gameOver = true;
//     }

//     // Score logic
//     if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].scored) {
//       score++;
//       pipes[i].scored = true;
//       if (score > highScore) highScore = score;
//     }

//     if (pipes[i].offscreen()) {
//       pipes.splice(i, 1);
//     }
//   }

//   drawScore();

//   if (gameOver) {
//     ctx.fillStyle = "rgba(0,0,0,0.5)";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = "white";
//     ctx.font = "36px Arial";
//     ctx.fillText("Game Over!", 150, canvas.height / 2 - 20);
//     ctx.fillText("Press R to Restart", 120, canvas.height / 2 + 40);
//   }
// }

// // --- Game Loop ---
// function gameLoop() {
//   update();
//   requestAnimationFrame(gameLoop);
// }

// // --- Controls ---
// document.addEventListener("keydown", (e) => {
//   if (e.code === "Space") {
//     if (!gameStarted) {
//       gameStarted = true;
//     }
//     if (!gameOver) {
//       bird.flap();
//     }
//   }
//   if (e.code === "KeyR" && gameOver) {
//     resetGame();
//   }
// });


// startBtn.addEventListener("click", () => {
//   overlay.style.transition = "opacity 0.8s ease";
//   overlay.style.opacity = "0";
//   setTimeout(() => {
//     overlay.style.display = "none";
//     startGame();
//   }, 800);
// });

// // Start the Loop
// gameLoop();




const landingScreen = document.getElementById("landingScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");

playBtn.addEventListener("click", () => {
  landingScreen.classList.add("hidden");
  gameStarted = true;
});

restartBtn.addEventListener("click", () => {
  resetGame();
  gameOverScreen.classList.add("hidden");
  gameStarted = true;
});

function update() {
  if (!gameStarted) return;

  frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.update();
  bird.draw();

  // Pipes and scoring...
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].draw();

    if (checkCollision(bird, pipes[i])) {
      gameOver = true;
    }

    if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].scored) {
      score++;
      pipes[i].scored = true;
      if (score > highScore) highScore = score;
    }

    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  drawScore();

  if (gameOver) {
    gameStarted = false;
    finalScore.textContent = score;
    finalBest.textContent = highScore;
    gameOverScreen.classList.remove("hidden");
  }
}
