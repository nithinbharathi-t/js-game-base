# 3D Game Base (Three.js)

A foundational 3D web-based game environment built with [Three.js](https://threejs.org/). This project provides a starting point for creating in-browser games, featuring a 3D scene, basic physics (gravity), collision detection, player movement, and environment setup.

## Features

- **3D Environment:** Rendering of a 3D scene leveraging Three.js. Includes custom textures like sky, grass, bricks, and buildings, as well as GLTF model loading support.
- **Player Movement Controller:** A standard first-person style movement system.
- **Physics and Collision Detection:** Basic gravity implementation and Axis-Aligned Bounding Box (AABB) collision checks against the ground, border walls, and objects.
- **Interactive Elements:** Features interactable entities (like "health" items) which trigger logic upon collision and are removed from the scene.
- **Flexible Setups:** Includes various main scripts for testing features.
  - `scriptCollision.js`: Primary setup with full perspective camera, movement, and collision detection physics.
  - `script.js`: Basic perspective camera scene, without collision constraints.
  - `scriptOrtho.js`: Setup showcasing an orthographic camera projection.

## Controls

- **W / Up Arrow:** Move Forward
- **S / Down Arrow:** Move Backward
- **A / Left Arrow:** Move Left
- **D / Right Arrow:** Move Right
- **Spacebar:** Jump
- **O:** Rotate Left
- **P:** Rotate Right

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/nithinbharathi-t/js-game-base.git
   cd js-game-base
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed on your machine.
   ```sh
   npm install
   ```

3. **Run the development server:**
   Start the Vite local development server.
   ```sh
   npx vite
   ```
   *Alternatively, you can start a local development server like VS Code's "Live Server" extension to serve the `index.html` file.*

## Project Structure

- `index.html`: Entry point. Imports Three.js dynamically via module import maps and loads the main game script.
- **Core Scripts:** 
  - `scriptCollision.js`: Handles collision and gravity logic.
  - `script.js`: Simple version of the main engine.
  - `scriptOrtho.js`: Isometric-style view version.
- **Assets:** Custom image textures (`brick.png`, `building.png`, `grass.png`, `sky.png`) and 3D models (`tree.glb`).

## Dependencies

- **three.js** - 3D JavaScript library.
- **vite** - Frontend build tool and development server.
