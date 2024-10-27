import "./src/css/style.css";
import Phaser from "phaser";

// WINDOW ATTRIBUTES
// -----------------------------------------------------------------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// COMET ATTRIBUTES
// -----------------------------------------------------------------------------
let cometSpeed = 60;
const cometScale = 0.4;
const cometWidth = 512;
const cometHeight = 512;
let cometSpawnInterval = 3000; // time in milliseconds (normal: 7000)
let cometsDestroyed = 0;

const wordWrapWidth = 150;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.comets = [];
    this.score = 0;
    this.level = 1;
    this.paused = false;
  }

  preload() {
    this.load.image("bg", "/assets/images/bg.png");
    this.load.image("comet", "/assets/images/comet.png");
  }

  create() {
    this.add
      .image(0, 0, "bg")
      .setOrigin(0, 0)
      .setDisplaySize(sizes.width, sizes.height);

    // spawn the comet immediately
    this.spawnComet();

    this.time.addEvent({
      delay: cometSpawnInterval,
      callback: this.spawnComet,
      callbackScope: this, // Ensures 'this' refers to the scene
      loop: true, // Loop the event to keep spawning
    });

    this.inputField = document.getElementById("wordInput");
    this.progressContainer = document.getElementById("progress-board");
    this.pauseOverlay = document.getElementById("pause-overlay");

    this.inputField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.destroyComet(inputField.value);
        inputField.value = "";
      }
    });

    this.scoreDisplay = document.getElementById("score-display");
    this.levelDisplay = document.getElementById("level-display");

    const pauseButtons = document.getElementsByClassName("btn");
    Array.from(pauseButtons).forEach((button) => {
      button.addEventListener("click", () => {
        this.togglePause();
      });
    });
  }

  update() {
    // Only update if the game is not paused
    if (!this.isPaused) {
      this.comets.forEach((comet, index) => {
        if (comet.y >= sizes.height) {
          comet.destroy();
          this.comets.splice(index, 1);
        }
      });
    }
  }

  // USER DEFINED FUNCTIONS
  // -----------------------------------------------------------------------------
  getRandomX() {
    // Calculate half of the comet's width after applying the scale factor.
    // This is used to ensure the comet is fully visible on the screen when spawned
    const cometWidthToOrigin = (cometWidth * cometScale) / 2;

    // Set the minimum X position for spawning comets.
    // Adding an offset of 325 ensures the comets don't spawn too close to the left side
    // or overlap with UI elements. Adding cometWidthToOrigin ensures the entire comet
    // remains visible on screen.
    const minX = 325 + cometWidthToOrigin; // Minimum to see the full image

    // Set the maximum X position for spawning comets.
    // This value is calculated by subtracting cometWidthToOrigin from the screen width (sizes.width),
    // ensuring the comet doesn't spawn partially off-screen on the right side.
    const maxX = sizes.width - cometWidthToOrigin; // The width of the spawn area

    // Generate a random X position within the range [minX, maxX].
    // The random value ensures that comets spawn at different positions each time.
    // Math.floor is used to round down to the nearest integer to keep the position a whole number.
    return Math.floor(Math.random() * (maxX - minX)) + minX; // in case Math.random() = 0, add the minX
  }

  generateRandomString() {
    let length = 1;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // All possible characters
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length); // Get a random index
      result += characters[randomIndex]; // Append the random character to the result
    }

    return result; // Return the generated string
  }

  spawnComet() {
    const cometSprite = this.physics.add
      .image(0, 0, "comet")
      .setOrigin(0.5)
      .setScale(cometScale);

    const cometText = this.add
      .text(0, 0, this.generateRandomString(), {
        fontSize: "20px",
        color: "#FFF",
        fontFamily: "Arial",
        wordWrap: { width: wordWrapWidth, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    const cometContainer = this.add.container(this.getRandomX(), 0, [
      cometSprite,
      cometText,
    ]);
    cometContainer.setSize(cometWidth * cometScale, cometHeight * cometScale);

    this.physics.world.enable(cometContainer);
    cometContainer.body.setVelocityY(cometSpeed);

    this.comets.push(cometContainer);
  }

  destroyComet(text) {
    this.comets.forEach((comet, index) => {
      const cometText = comet.list[1];

      if (cometText.text === text) {
        comet.destroy();
        this.comets.splice(index, 1); // Remove comet from the array

        cometsDestroyed++;
        this.score += cometSpeed;
        this.scoreDisplay.innerText = `${this.score}`;

        // check if the user destroyed 5 comets
        if (cometsDestroyed % 5 === 0) {
          if (cometSpeed < 200) {
            cometSpeed += 20;
          }

          if (cometSpawnInterval > 4000) {
            cometSpawnInterval -= 200;
          }

          this.levelDisplay.innerText = `${(this.level += 1)}`;
          console.log(this.level);
        }
      }
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    // Check if game should be paused or resumed
    if (this.isPaused) {
      this.physics.pause(); // Pause all physics-related activity
      this.time.paused = true; // Pause timed events (e.g., comet spawning)

      this.pauseOverlay.style.display = "block";

      this.inputField.style.display = "none";
      this.progressContainer.style.display = "none";
    } else {
      this.physics.resume(); // Resume physics
      this.time.paused = false; // Resume timed events

      this.pauseOverlay.style.display = "none";

      this.inputField.style.display = "block";
      this.progressContainer.style.display = "inline-flex";
    }
  }
}

const config = {
  width: sizes.width,
  height: sizes.height,
  type: Phaser.WEBGL,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
