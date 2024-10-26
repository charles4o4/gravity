import './style.css'
import Phaser, { Physics } from 'phaser'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const speedDown = 300

class GameScene extends Phaser.Scene{
  constructor() {
    super("scene-game")
  }

  preload(){
    this.load.image("bg", "/assets/bg.png")
  }

  create(){
    this.add.image(0, 0, "bg").setOrigin(0,0).setDisplaySize(sizes.width, sizes.height)
  }
  update(){}
}

const config = {
  width: sizes.width,
  height: sizes.height,
  type: Phaser.WEBGL,
  canvas: gameCanvas,
  physics: {
    default: "arcade", 
    arcade: {
      gravity: {y:speedDown},
      debug: true
    }
  }, 
  scene:[GameScene]
}

const game = new Phaser.Game(config)