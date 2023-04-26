import Phaser from 'phaser'
import { SCALE } from '../gameConst'

const BOMB_WIDTH = 158 * SCALE
const BOMB_HEIGHT = 73 * SCALE
const BOMB_LIGHT_RADIUS = 500 * SCALE
const BOMB_DELAY = 1 * 1000
const BOMB_PUSH_POWER = 200
const BOMB_DAMAGE = 1000

export const BOMB_RANGE = 1000

class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, particle) {
      super(scene, x, y, 'bomb')

      this.scene.add.existing(this)
      this.scene.physics.add.existing(this)
      this.scene.physics.add.collider(this, this.scene.platformGroup)

      this.particle = particle
      this.light = this.scene.lights.addLight(x, y, BOMB_LIGHT_RADIUS)

      this.setDisplaySize(BOMB_WIDTH, BOMB_HEIGHT)
      this.setPipeline('Light2D')
      this.play({
          key: 'bombAnim',
          repeat: -1,
          frameRate: 8
      })

      this.scene.bombGroup.add(this)
      this.scene.events.on('update', this.update, this)
      setTimeout(() => this.explode(), BOMB_DELAY)
    }
  
    update() {
      this.light.x = this.x
      this.light.y = this.y
    }

    explode() {
      // hit near players
      const players = this.scene.playerGroup.getChildren()
      for(let i = 0; i < players.length; i++) {
        const player = players[i]
        if (Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) < BOMB_RANGE) {
          player.hit(this.x, this.y, BOMB_PUSH_POWER, BOMB_DAMAGE)
        }
      }

      // play sound
      this.scene.sound.play('explode1', { volume: 0.6 })
      this.scene.sound.play('explode2', { volume: 0.6 })
      this.particle.emitParticleAt(this.x, this.y)

      this.kill()
    }
    
    kill() {
      this.scene.lights.removeLight(this.light)
      this.scene.events.off('update', this.update, this)
      this.scene.cameras.main.shake(1000, 0.003)
      this.scene.bombGroup.remove(this)
      this.destroy(true)
    }
}

export default Bomb