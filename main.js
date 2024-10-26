import './style.css'
import Phaser, { Physics } from 'phaser'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const cometSpeed = 100
const cometScale = 0.3
const cometWidth = 512

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
  
    this.target = this.physics.add.image(0, this.getRandomX(), 'comet').setOrigin(0,0).setScale(cometScale).setVelocityY(cometSpeed)
  }

  update(){
    // check if the comet is not visable anymore
    if (this.target.y >= sizes.height) {
      this.target.setY(0)
      this.target.setX(this.getRandomX())
    }
  }

  getRandomX() {
    // we are subtracting cometWidth * cometScale from sizes.width
    // because we want to be able to see the comet if it spawns completely right
    // keep in mind that the origin of the sprite is (0,0)
    return Math.floor(Math.random() * (sizes.width - cometWidth * cometScale))
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