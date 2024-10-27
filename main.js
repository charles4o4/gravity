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
let cometSpawnInterval = 7000; // time in milliseconds
let cometsDestroyed = 0;

const wordWrapWidth = 150;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.comets = [];
    this.score = 0;
    this.level = 1;
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

    const inputField = document.getElementById("wordInput");
    inputField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.destroyComet(inputField.value);
        inputField.value = "";
      }
    });

    this.scoreDisplay = document.getElementById("score-display");
    this.levelDisplay = document.getElementById("level-display");
  }

  update() {
    this.comets.forEach((comet, index) => {
      // Check if the comet is not visible anymore
      if (comet.y >= sizes.height) {
        // Destroy the comet and remove it from the array
        comet.destroy();
        this.comets.splice(index, 1); // Remove comet from the array
      }
    });
  }

  // USER DEFINED FUNCTIONS
  // -----------------------------------------------------------------------------
  getRandomX() {
    // UPDATE THIS

    // keep in mind that the origin is 0.5
    const minX = (cometWidth * cometScale) / 2; // Minimum to see the full image
    const maxX = sizes.width - minX; // The width of the spawn area

    return Math.floor(Math.random() * (maxX - minX)) + minX + 300; // in case Math.random() = 0, add the minX
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
