import Phaser from 'phaser'
import Bomb, { BOMB_RANGE } from './Bomb'
import { SCALE } from '../gameConst'

export const PLAYER_WIDTH = 128 * 4 * SCALE
export const PLAYER_HEIGHT = 128 * 4 * SCALE
const PLAYER_LIGHT_RADIUS = 500 * SCALE
const PLAYER_BODY_WIDTH = 43
const PLAYER_BODY_HEIGHT = 66
const PLAYER_BODY_OFFSET_X = 43
const PLAYER_BODY_OFFSET_Y = 49
export const PLAYER_TIME = 1 * 60 * 1000

const BULLET_COUNTDOWN = 100
export const BULLET_RANGE = 2000

const BOMB_COUNTDOWN = 10 * 1000

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
      super(scene, x, y, 'player')

      this.scene.add.existing(this)
      this.scene.physics.add.existing(this)

      this.jumpPower = 2
      this.bullets = []
      this.haveBullet = true
      this.haveBomb = true
      this.isRage = false
      this.time = PLAYER_TIME
      this.animation = ''
      this.isShooting = false
      this.isShootingTimeout = null
      this.isKilled = false
      this.damage = 1000

      this.trail = this.scene.add.graphics()
      this.ray = this.scene.raycaster.createRay()
      this.light = this.scene.lights.addLight(x, y, PLAYER_LIGHT_RADIUS)
      this.rect = this.scene.add.rectangle(
        this.body.x + this.body.width / 2,
        this.body.y + this.body.height / 2,
        this.body.width,
        this.body.height,
      )

      // particles
      this.rageParticle = this.scene.add.particles(x, y, new Phaser.Geom.Rectangle(0, 0, 100, 100), {
        scale: { start: 1, end: 0 },
        speedX: { max: 200, min: -200 },
        speedY: { max: 300, min: -300 },
        frequency: 20,
        lifespan: 1000,
        tint: 0xff5ea1,
        tintFill: true,
        emitting: false
      })
      this.hitParticle = this.scene.add.particles(null, null, new Phaser.Geom.Rectangle(0, 0, 100, 100), {
        scale: { start: 1, end: 0 },
        speedX: { max: 200, min: -200 },
        speedY: { max: 300, min: -300 },
        quantity: 5,
        lifespan: 1000,
        tint: {
          start: 0xFF8855,
          end: 0x3F3A39
        },
        tintFill: true,
        emitting: false
      })
      this.bombParticle = this.scene.add.particles(null, null, new Phaser.Geom.Rectangle(0, 0, 100, 100), {
        scale: { start: 1, end: 0 },
        speedX: { max: BOMB_RANGE, min: -BOMB_RANGE },
        speedY: { max: BOMB_RANGE, min: -BOMB_RANGE },
        quantity: 50,
        lifespan: 1000,
        tint: {
          start: 0xFF8855,
          end: 0x3F3A39
        },
        tintFill: true,
        emitting: false
      })
      this.jumpParticle = this.scene.add.particles(null, null, new Phaser.Geom.Rectangle(0, 0, 100, 100), {
        scale: { start: 1, end: 0 },
        speedX: { max: 400, min: -400 },
        speedY: { max: 30, min: -30 },
        quantity: 20,
        lifespan: 1000,
        tint: 0xffffff,
        tintFill: true,
        emitting: false
      })

      
      this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT).setPipeline('Light2D')
      this.ray.setRayRange(BULLET_RANGE)
      this.trail.fillStyle(0xffffff).fillRect(0, 0, 100, 100)
      this.body.useDamping = true
      this.body
        .setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT)
        .setOffset(PLAYER_BODY_OFFSET_X, PLAYER_BODY_OFFSET_Y)
        .setMaxVelocityX(1100)
        .setDragX(0.1)
  
      this.rect.objectType = 'PLAYER'
      this.rect.hit = (...args) => this.hit(...args)
      this.timer = setInterval(() => {
        this.time = this.time - 1000
        if (this.time <= 0) this.kill()
      }, 1000)
  
      this.scene.events.on('update', this.update, this)
    }
    
    update() {
      if (this.y > 4000) return this.kill()
      if (this.isKilled) return

      if (this.body.onFloor()) this.jumpPower = 2

      this.setAcceleration(0)

      if (this.isKilled) {
        this.setAnimation('playerDeath')
      } else if (this.isShooting) {
        this.setAnimation('playerShoot')
      } else if (Math.abs(this.body.velocity.x) < 25) {
        this.setAnimation('playerIdle')
      } else {
        this.setAnimation('playerWalk')
      }

      this.light.x = this.x
      this.light.y = this.y

      this.rageParticle.x = this.x
      this.rageParticle.y = this.y

      this.rect.setX(this.body.x + this.body.width / 2)
      this.rect.setY(this.body.y + this.body.height / 2)

      this.clearTint()
      this.isRage && this.setTint(0xff75af)

      // draw bullet trails
      this.trail.clear()
      for (let i = 0; i < this.bullets.length; i++) {
        const bullet = this.bullets[i]

        if (bullet.step === 11) {
          this.bullets.splice(i, 1)
          i--
          continue
        }

        this.trail.lineStyle(bullet.width, 0xffffff, 1 - bullet.step / 10)
          .beginPath()
          .moveTo(...bullet.from)
          .lineTo(...bullet.to)
          .stroke()

        bullet.step++
      }
    }

    hit(x, y, strength, damage) {
      this.setTintFill(0xffffff)
      this.setAccelerationX((x < this.x ? 1 : -1) * strength * 1000)
      this.setAccelerationY((y < this.y ? 1 : -1) * strength * 1000)
      this.time -= damage
    }

    jump() {
      if (!this.jumpPower) return
      this.setVelocityY(-1800)
      this.jumpPower--
      this.jumpParticle.emitParticleAt(this.x, this.y)
    }

    slide() {
      this.setAccelerationY(7000)
    }

    move(direction) {
      this.setAccelerationX(3000 * direction)
      this.haveBullet && this.setFlipX(direction === -1)
    }

    rage() {
      this.setVelocityY(-1000)

      this.isRage = true
      this.setTint(0xff75af)
      this.light.setIntensity(1.5)
      this.setDisplaySize(PLAYER_WIDTH * 1.15, PLAYER_HEIGHT * 1.15)
      this.rageParticle.start()
      
      setTimeout(() => {
        this.clearTint()
        this.light.setIntensity(1)
        this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT)
        this.isRage = false
        this.rageParticle.stop()
      }, 3000)
    }

    setAnimation(newAnimation, repeat = -1) {
      if (newAnimation === this.animation) return
      this.animation = newAnimation
      this.stop()
      this.play({
        key: newAnimation,
        repeat: repeat,
        frameRate: 20
      })
    }

    shoot(x, y) {
      if (!this.haveBullet) return

      this.scene.sound.play('shoot', { volume: 0.1 })

      this.setFlipX(x < this.x)

      // update isShooting state for animation
      this.isShooting = true
      clearTimeout(this.isShootingTimeout)
      this.isShootingTimeout = setTimeout(() => {
        this.isShooting = false
      }, BULLET_COUNTDOWN * 2)

      // raytrace
      const extraAngle = Math.random() * 0.05
      const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y) + extraAngle
      const origin = [this.x + (200 * Math.cos(angle)), this.y + (200 * Math.sin(angle))]
  
      this.ray.setOrigin(origin[0], origin[1])
      this.ray.setAngle(angle)
      const intersection = this.ray.cast()

      // manage bullet
      this.bullets.push({
        width: this.isRage ? 15 : 10,
        from: origin,
        to: [
          intersection.x || this.x + BULLET_RANGE * Math.cos(angle),
          intersection.y || this.y + BULLET_RANGE * Math.sin(angle)
        ],
        step: 1
      })

      this.haveBullet = false
      setTimeout(() => {
        this.haveBullet = true
      }, BULLET_COUNTDOWN)

      // manage damage
      if (intersection) {
        const damage = this.isRage ? this.damage * 5 : this.damage
        this.hitParticle.emitParticleAt(intersection.x, intersection.y, this.isRage ? 8 : 3)
        intersection.object?.hit?.(intersection.x, intersection.y, this.isRage ? 3 : 1, damage)
        if (intersection.object?.objectType === 'PLAYER') this.time += damage
        this.onHit?.(damage)
      }

    }

    bomb() {
      if (!this.haveBomb) return

      new Bomb(
        this.scene,
        this.x,
        this.y,
        this.bombParticle
      )

      this.haveBomb = false
      setTimeout(() => {
        this.haveBomb = true
      }, BOMB_COUNTDOWN)
    }
    
    kill() {
      this.isKilled = true

      this.scene.events.off('update', this.update, this)
      this.setAnimation('playerDeath', 0)
      this.hitParticle.destroy()
      this.rageParticle.destroy()
      this.scene.raycaster.removeMappedObjects(this.rect)
      this.scene.lights.removeLight(this.light)
      this.scene.playerGroup.remove(this)
      this.rect.destroy()
      this.ray.destroy()
      this.trail.destroy()
      this.disableBody()
      clearInterval(this.timer)
      this.scene.sound.play('powerup')
      this.scene.bgMusic.stop()

      this.onDie?.()

      setTimeout(() => {
        this.setAlpha(0)
        this.destroy(true)
      }, 10 * 1000)
    }
}

export default Player