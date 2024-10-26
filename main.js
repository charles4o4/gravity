import "./style.css";
import Phaser from "phaser";

// WINDOW ATTRIBUTES
// -----------------------------------------------------------------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// COMET ATTRIBUTES
// -----------------------------------------------------------------------------
const cometSpeed = 70;
const cometScale = 0.4;
const cometWidth = 512;
const cometHeight = 512;
const cometSpawnInterval = 7000; // time in milliseconds
let cometsSpawned = 0;

const wordWrapWidth = 150;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.comets = [];
  }

  preload() {
    this.load.image("bg", "/assets/bg.png");
    this.load.image("comet", "/assets/comet.png");
  }

  create() {
    this.add
      .image(0, 0, "bg")
      .setOrigin(0, 0)
      .setDisplaySize(sizes.width, sizes.height);

    // spawn the comet immediately
    this.spawnComet();
    cometsSpawned++;

    this.time.addEvent({
      delay: cometSpawnInterval,
      callback: this.spawnComet,
      callbackScope: this, // Ensures 'this' refers to the scene
      loop: true // Loop the event to keep spawning
    });
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

  getRandomX() {
    // keep in mind that the origin is 0.5
    const minX = (cometWidth * cometScale) / 2; // Minimum to see the full image
    const maxX = sizes.width - minX; // The width of the spawn area

    return Math.floor(Math.random() * (maxX - minX)) + minX; // in case Math.random() = 0, add the minX
  }

  spawnComet() {
    const cometSprite = this.physics.add
      .image(0, 0, "comet")
      .setOrigin(0.5)
      .setScale(cometScale);

    const cometText = this.add
      .text(0, 0, "word", {
        fontSize: "16px",
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

    this.comets.push(cometContainer)
    cometsSpawned++;
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
      debug: true,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
