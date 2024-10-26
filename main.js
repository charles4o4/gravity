import './style.css'
import Phaser from 'phaser'

// WINDOW ATTRIBUTES
// -----------------------------------------------------------------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// COMET ATTRIBUTES
// -----------------------------------------------------------------------------
const cometSpeed = 100
const cometScale = 0.4
const cometWidth = 512
const cometHeight = 512

const wordWrapWidth = 150

class GameScene extends Phaser.Scene{
  constructor() {
    super("scene-game")
    this.target;
  }

  preload(){
    this.load.image("bg", "/assets/bg.png")
    this.load.image("comet", "/assets/comet.png")
  }

  create(){
    this.add.image(0, 0, "bg").setOrigin(0,0).setDisplaySize(sizes.width, sizes.height)
  
    // COMET CONTAINER
    // -----------------------------------------------------------------------------
    const cometSprite = this.physics.add.image(0, 0, 'comet').setOrigin(0.5).setScale(cometScale)

    const cometText = this.add.text(0, 0, 'word', {
      fontSize: '16px',
      color: '#FFF',
      fontFamily: 'Arial',
      wordWrap: {width: wordWrapWidth, useAdvancedWrap: true}
    }).setOrigin(0.5)

    this.target = this.add.container(this.getRandomX(), 0, [cometSprite, cometText])
    this.target.setSize(cometWidth * cometScale, cometHeight * cometScale)

    this.physics.world.enable(this.target)
    this.target.body.setVelocityY(cometSpeed)


  }

  update(){
    // check if the comet is not visable anymore, if true DESTROY!
    if (this.target.y >= sizes.height) {
      this.target.setY(0)
      this.target.setX(this.getRandomX())
    }
  }

  getRandomX() {  
    // keep in mind that the origin is 0.5
    const minX = cometWidth * cometScale / 2; // Minimum to see the full image 
    const maxX = sizes.width - minX; // The width of the spawn area

    return Math.floor(Math.random() * (maxX - minX)) + minX // in case Math.random() = 0, add the minX
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
      debug: true
    }
  }, 
  scene:[GameScene]
}

const game = new Phaser.Game(config)