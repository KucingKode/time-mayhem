import Player from './Player'

const VISION_RANGE = 1200

class PlayerAI extends Player {
	constructor(scene, x, y) {
		super(scene, x, y)

		this.lastX = this.x
		this.lastChange = 0
		this.time = 1 * 60 * 1000
		this.damage = 500
		this.visionRange = Math.floor(1000 * Math.random()) + 1000

		setTimeout(() => {
			this.scene.events.on('update', this.makeAIMove, this)
		}, 2000)

		this.targetX = 5000
		this.nextTargetX = 3000
	}

	onDie() {
		this.scene.events.off('update', this.makeAIMove, this)
		this.scene.enemyCount--
		if (this.scene.enemyCount === 0) this.scene.spawnEnemy()
	}

	makeAIMove() {
		if (this.isKilled) return

		if (
			Phaser.Math.Distance.Between(this.x, 100, this.lastX, 100) < 100 &&
			this.lastChange > 200
		) {
			// change movement target
			const nextTargetX = this.targetX
			this.targetX = this.nextTargetX
			this.nextTargetX = nextTargetX
			this.lastChange = 0
		}

		if (Math.random() > 0.3) {
			// attack other player
			const players = this.scene.playerGroup.getChildren()

			let target
			let targetDist = 0
			for (let i = 0; i < players.length; i++) {
				const player = players[i]
				if (player === this) continue
				const dist = Phaser.Math.Distance.Between(
					player.x,
					player.y,
					this.x,
					this.y,
				)
				if (dist < VISION_RANGE && targetDist < dist) {
					target = player
					targetDist = dist
				}
			}

			target && this.shoot(target.x, target.y)
		}

		// movement
		this.lastX = this.x
		this.move(this.x < this.targetX ? 1 : -1)
		this.lastChange++
		Math.random() < 0.4 && this.jump()

		// bomb
		Math.random() > 0.5 && this.bomb()
	}
}

export default PlayerAI
