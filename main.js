import "./src/css/style.css";
import Phaser from "phaser";

// USER INPUT
// -----------------------------------------------------------------------------
const text = sessionStorage.getItem("text");

// flashcards[0] = flashcard
// flashcards[0][0] = term
// flashcards[0][1] = definition
let flashcards = [];

text.split(";").forEach((element) => {
  if (element.trim() !== "") {
    // Check if the element is not empty
    flashcards.push(element.split("\t"));
  }
});

console.log(flashcards);

// WINDOW ATTRIBUTES
// -----------------------------------------------------------------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// CONSTANTS
// -----------------------------------------------------------------------------
const cometScale = 0.4;
const cometWidth = 512;
const cometHeight = 512;
const wordWrapWidth = 150;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");

    // QUANTATIES AND BOOLEANS
    // -----------------------------------------------------------------------------
    this.userInput = "";

    // QUANTATIES AND BOOLEANS
    // -----------------------------------------------------------------------------
    this.score = 0;
    this.level = 1;
    this.paused = false;
    this.cometsDestroyed = 0;

    this.comets = [];
    this.flashcardsInUse = [];
    this.failures = [];

    // COMET ATTRIBUTES
    // -----------------------------------------------------------------------------
    this.cometSpeed = 60;
    this.cometMaxSpeed = 100;
    this.cometSpawnInterval = 6000; // time in milliseconds (normal: 7000)
    this.cometMaxSpawnInterval = 5000;
  }

  preload() {
    this.load.image("bg", "/assets/images/bg.jpg");
    this.load.image("yellowapple", "/assets/images/yellowapple.png");
    this.load.image("redapple", "/assets/images/redapple.png");
  }

  create() {
    this.add
      .image(0, 0, "bg")
      .setOrigin(0, 0)
      .setDisplaySize(sizes.width, sizes.height);

    // spawn the comet immediately
    this.spawnComet();

    this.time.addEvent({
      delay: this.cometSpawnInterval,
      callback: this.spawnComet,
      callbackScope: this, // Ensures 'this' refers to the scene
      loop: true, // Loop the event to keep spawning
    });

    // HTML ELEMENTS
    // -----------------------------------------------------------------------------
    this.inputField = document.getElementById("wordInput");
    this.progressContainer = document.getElementById("progress-board");
    this.pauseOverlay = document.getElementById("pause-overlay");
    this.answerOverlay = document.getElementById("answer-overlay");
    this.answer = document.getElementById("answer");
    this.answerField = document.getElementById("answerInput");
    this.scoreDisplay = document.getElementById("score-display");
    this.levelDisplay = document.getElementById("level-display");
    this.gameOverDisplay = document.getElementById("game-over");

    // EVENT LISTENERS
    // -----------------------------------------------------------------------------
    // destroy comet with input
    this.inputField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.userInput = this.inputField.value;
        this.destroyComet(this.inputField.value);
        this.inputField.value = "";
      }
    });

    // show the last input
    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.inputField.value = this.userInput;

        // Move the cursor to the end of the input
        setTimeout(() => {
          this.inputField.setSelectionRange(
            this.userInput.length,
            this.userInput.length
          ); 
        }, 1); // 0 -> it will not work
      }
    });

    // Answer Overlay
    this.answerField.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        if (
          this.answerField.value ==
          this.failures[this.failures.length - 1].definition
        ) {
          this.destroySameComets(
            this.failures[this.failures.length - 1].definition
          );
          this.togglePause();
          this.showAnswerOverlay();
          this.inputField.focus();
          this.inputField.value = "";
        }
      }
    });

    // Pause Overlay
    const pauseButtons = document.getElementsByClassName("btn");
    Array.from(pauseButtons).forEach((button) => {
      button.addEventListener("click", () => {
        this.togglePause();
        this.showPauseOverlay();
        // destroy all comets function:
      });
    });
  }

  update() {
    // Only update if the game is not paused
    if (!this.isPaused) {
      this.comets.forEach((comet, index) => {
        if (comet.y >= sizes.height) {
          const alreadyExists = this.failures.some(
            (failure) => failure.term === comet.list[1].text
          );

          if (alreadyExists) {
            this.togglePause();
            this.gameOver();
          } else {
            this.failures.push({
              term: comet.list[1].text,
              definition: comet.hiddenDefinition,
            });

            this.togglePause();
            this.showAnswerOverlay();
          }
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

  getRandomFlashcard() {
    // It should pick a random flashcard that hasn't been used yet.
    // If all flashcards have appeared, the process should start from the beginning.

    if (flashcards.length === 0) {
      flashcards = this.flashcardsInUse;
      this.flashcardsInUse = [];
    }

    // get random flashcard
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    const flashcard = flashcards[randomIndex];

    // remove it from flashcards and add it in flashcardsInUse
    flashcards.splice(randomIndex, 1);
    this.flashcardsInUse.push(flashcard);

    // return the word
    return flashcard;
  }

  spawnComet() {
    const [term, definition] = this.getRandomFlashcard();

    const texture = this.failures.some((failure) => failure.term === term)
      ? "redapple"
      : "yellowapple";

    const cometSprite = this.physics.add
      .image(0, 0, texture)
      .setOrigin(0.5)
      .setScale(cometScale);

    const cometTerm = this.add
      .text(0, 0, term, {
        fontSize: "20px",
        color: "#000", // Black text
        fontFamily: "Arial",
        wordWrap: { width: wordWrapWidth, useAdvancedWrap: true },
        stroke: "#FFF", // White outline
        strokeThickness: 3, // Adjust thickness as needed
      })
      .setOrigin(0.5);

    const cometContainer = this.add.container(this.getRandomX(), 0, [
      cometSprite,
      cometTerm,
    ]);
    // add definition as a property so its invisible
    cometContainer.hiddenDefinition = definition;

    cometContainer.setSize(cometWidth * cometScale, cometHeight * cometScale);

    this.physics.world.enable(cometContainer);
    cometContainer.body.setVelocityY(this.cometSpeed);

    this.comets.push(cometContainer);
  }

  destroyComet(text) {
    for (let index = 0; index < this.comets.length; index++) {
      const comet = this.comets[index];

      // Assuming hiddenDefinition is the property that stores the definition
      if (comet.hiddenDefinition === text) {
        comet.destroy();
        this.comets.splice(index, 1); // Remove comet from the array

        this.cometsDestroyed++;
        this.score += this.cometSpeed;
        this.scoreDisplay.innerText = `${this.score}`;

        // Check if the user destroyed 5 comets
        if (this.cometsDestroyed % 5 === 0) {
          if (this.cometSpeed < this.cometMaxSpeed) {
            this.cometSpeed += 20;
          }

          if (this.cometSpawnInterval < this.cometMaxSpawnInterval) {
            this.cometSpawnInterval -= 200;
          }

          this.levelDisplay.innerText = `${(this.level += 1)}`;
        }

        break;
      }
    }
  }

  destroySameComets(text) {
    // Create a new array excluding the comets that match the text
    this.comets = this.comets.filter((comet) => {
      if (comet.hiddenDefinition === text) {
        comet.destroy(); // Destroy the comet
        return false; // Exclude this comet from the new array
      }
      return true; // Keep this comet in the new array
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    // Check if game should be paused or resumed
    if (this.isPaused) {
      this.physics.pause(); // Pause all physics-related activity
      this.time.paused = true; // Pause timed events (e.g., comet spawning)

      this.inputField.style.display = "none";
      this.progressContainer.style.display = "none";
    } else {
      this.physics.resume(); // Resume physics
      this.time.paused = false; // Resume timed events

      this.inputField.style.display = "block";
      this.progressContainer.style.display = "inline-flex";
    }
  }

  showPauseOverlay() {
    if (this.isPaused) {
      this.pauseOverlay.style.display = "block";
    } else {
      this.pauseOverlay.style.display = "none";
    }
  }

  showAnswerOverlay() {
    if (this.isPaused) {
      this.answerField.value = "";
      this.answer.innerText = `Term: ${
        this.failures[this.failures.length - 1].term
      } - Answer: ${this.failures[this.failures.length - 1].definition}`;
      this.answerOverlay.style.display = "block";
      this.answerField.focus();
    } else {
      this.answer.innerText = "";
      this.answerOverlay.style.display = "none";
    }
  }

  gameOver() {
    this.gameOverDisplay.style.display = "block";
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
