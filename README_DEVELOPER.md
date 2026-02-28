# Flappy Bird Pro - Technical Architecture

This project follows a production-grade, modular architecture designed for scalability, maintainability, and high performance.

## 1. Project Structure
```text
/src
├── ai/
│   ├── Agent.js        # Abstract base for AI agents
│   └── HeuristicAgent.js # Rule-based pilot for demonstration
├── core/
│   ├── Config.js       # Centralized game constants & magic numbers
│   ├── EventBus.js     # Pub/Sub system for decoupled communication
│   └── Game.js         # Core engine, loop management, and systems orchestration
├── entities/
│   ├── Entity.js       # Base class for all game objects
│   ├── Bird.js         # Player logic and physics
...
├── utils/
│   ├── AssetLoader.js  # Async resource management (images/audio)
│   └── GameMode.js     # Enum for Mission Modes (Human, AI, Training)
└── main.js             # Application entry point and UI-Game bridge
```

## 2. Core Architectural Principles

### Separation of Concerns (SoC)
- **Entities**: Handle their own state and internal logic (e.g., Bird calculates its own rotation).
- **Core Engine**: Manages the life cycle (input -> update -> draw) and interaction between entities (collisions).
- **UI Bridge**: `main.js` handles DOM interactions and triggers game events via the `EventBus`.

### Decoupling with Event Bus
Instead of entities having direct references to UI or vice versa, they communicate via an `EventBus`. For example, when the bird hits a pipe, the `Game` emits a `game_over` event, which the UI listens for to show the score card.

### Physics-Based Movement
The game uses a standard Euler integration for movement:
`velocity += gravity * dt`
`position += velocity * dt`
This ensures smooth, predictable movement across different frame rates.

### Optimized Rendering
- **Logical Scaling**: The game internal logic runs on a 288x512 grid, while the canvas is scaled to fit the screen. This ensures consistent gameplay regardless of resolution.
- **Batched Drawing**: Entites are drawn in a specific order (BG -> Pipes -> Ground -> Bird) to ensure proper layering without excessive context switching.

## 3. Mission Modes & AI Architecture

The project implements a plug-and-play AI system with three distinct modes:

### Human Mode ( পাইলট)
Standard manual controls via keyboard or touch.

### AI Inference Mode (🤖)
The game engine polls the `Agent` class for actions. The `HeuristicAgent` uses real-time environment data to navigate gaps.

### Training Mode (🧠)
High-speed simulation mode. Rendering is disabled to maximize CPU throughput, allowing a reinforcement learning model to play thousands of episodes in minutes.

## 4. Environment API (OpenAI Gym Style)

The `Game` engine exposes a standardized interface for AI training:
- `getState()`: Returns normalized vectors (Bird Y, Pipe Distance, Gap position).
- `step(action)`: Executes an action (Flap/Idle) and returns a scalar reward.
- `isDone()`: Boolean state for episode termination.

## 3. How to Run Locally

1. **Prerequisites**: A modern web browser.
2. **Setup**:
   - Clone the repository.
   - Since this project uses **ES Modules**, it must be served via a local web server (modules cannot be loaded from `file://` due to CORS).
3. **Running**:
   - Using VS Code: Install the **Live Server** extension and click "Go Live".
   - Using Python: Run `python -m http.server 8000` in the root directory.
   - Using Node: Run `npx serve .`

## 4. Future Scalability Suggestions

### Multi-Skin System
The `AssetLoader` can be expanded to load texture atlases (spritesheets) instead of individual files. The `Bird` class can support multiple "BirdModels" with different physics parameters.

### ECS (Entity Component System)
For a more complex game, moving to a full ECS architecture (using a library or custom implementation) would allow for more flexible composition of behaviors (e.g., adding a "PowerUp" component to any entity).

### Particle System
Implementing a dedicated `ParticleSystem` class would allow for visual effects like feathers falling when the bird flaps or dust clouds when it hits the ground.

### Backend Integration
Integrating with a service like Firebase or a custom Node.js backend would allow for global leaderboards and user accounts.
