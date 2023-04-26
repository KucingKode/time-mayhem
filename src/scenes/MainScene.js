import Phaser from 'phaser'
import { SCALE } from '../gameConst'
import Platform from '../classes/Platform'
import Player, { PLAYER_TIME, PLAYER_HEIGHT } from '../classes/Player'
import PlayerAI from '../classes/PlayerAI'
import Powerup, { POWERUP_HEIGHT } from '../classes/Powerup'

const PLATFORM_MARGIN_X = 1500
const PLATFORM_MARGIN_Y = 1000
const POWERUP_SPAWN_INTERVAL = 30 * 1000

const platformConfig = {
	// width, height, bodyOffsetX, bodyOffsetY
	small: [907 * SCALE, 292 * SCALE],
	normal: [937 * SCALE, 302 * SCALE],
	big: [1109 * SCALE, 357 * SCALE],
}

const platforms = [
	// x, y, config
	[
		(1049 + PLATFORM_MARGIN_X) * SCALE,
		(476 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.small,
	],
	[
		(3496 + PLATFORM_MARGIN_X) * SCALE,
		(485 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.normal,
	],
	[
		(5318 + PLATFORM_MARGIN_X) * SCALE,
		(406 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.normal,
	],

	[
		(362 + PLATFORM_MARGIN_X) * SCALE,
		(1040 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.small,
	],
	[
		(2182 + PLATFORM_MARGIN_X) * SCALE,
		(1030 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.normal,
	],
	[
		(4802 + PLATFORM_MARGIN_X) * SCALE,
		(1040 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.normal,
	],

	[
		(1223 + PLATFORM_MARGIN_X) * SCALE,
		(1604 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.big,
	],
	[
		(2856 + PLATFORM_MARGIN_X) * SCALE,
		(1604 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.big,
	],
	[
		(3965 + PLATFORM_MARGIN_X) * SCALE,
		(1604 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.big,
	],

	[
		(223 + PLATFORM_MARGIN_X) * SCALE,
		(1961 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.small,
	],
	[
		(2010 + PLATFORM_MARGIN_X) * SCALE,
		(1982 + PLATFORM_MARGIN_Y) * SCALE,
		platformConfig.big,
	],
]

const theme = ['dark', 'paradise', 'desert', 'desert'][
	Math.floor(Math.random() * 3)
]

export default class MainScene extends Phaser.Scene {
	constructor() {
		super('main')
	}

	// add powerup item to map
	addPowerup() {
		const platformIndex = Math.floor(Math.random() * (platforms.length - 1))
		const platform = platforms[platformIndex]
		const [x, y, config] = platform
		const [width] = config

		const powerupObject = new Powerup(
			this,
			x + width / 2,
			y - POWERUP_HEIGHT / 2
		)

		this.powerupGroup.add(powerupObject)
		return powerupObject
	}

	// add player to map
	addPlayer(platformIndex, useAI = false) {
		const platform = platforms[platformIndex]
		const [x, y, config] = platform
		const [width] = config

		const playerClass = useAI ? PlayerAI : Player
		const playerObject = new playerClass(
			this,
			x + width / 2,
			y - PLAYER_HEIGHT / 2
		)

		this.playerGroup.add(playerObject)
		this.raycaster.mapGameObjects(playerObject.rect, true)
		return playerObject
	}

	preload() {
		this.load.image('bg/dark', 'assets/dark-bg.png')
		this.load.image('platform/dark', 'assets/dark-platform.png')
		this.load.image('bg/desert', 'assets/desert-bg.png')
		this.load.image('platform/desert', 'assets/desert-platform.png')
		this.load.image('bg/paradise', 'assets/paradise-bg.png')
		this.load.image('platform/paradise', 'assets/paradise-platform.png')
		this.load.spritesheet('powerup', 'assets/powerup.png', {
			frameWidth: 487,
			frameHeight: 881,
		})
		this.load.spritesheet('player', 'assets/player.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('bomb', 'assets/bomb.png', {
			frameWidth: 474,
			frameHeight: 219,
		})
		this.load.audio('bg', 'assets/bg.wav')
		this.load.audio('powerup', 'assets/powerup.wav')
		this.load.audio('shoot', 'assets/shoot.wav')
		this.load.audio('explode1', 'assets/explode1.wav')
		this.load.audio('explode2', 'assets/explode2.wav')
	}

	spawnEnemy() {
		this.addPlayer(2, true)
		this.addPlayer(3, true)
		this.addPlayer(5, true)
		this.enemyCount = 3

		const text = this.add
			.text(
				this.game.config.width / 2,
				this.game.config.height / 2,
				`ROUND ${this.round}`,
				{
					color: 'white',
					fontSize: '200px',
					fontFamily: 'vt323',
					stroke: 'black',
					strokeThickness: 10,
				},
			)
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0)
			.setDepth(1000)
		this.round++

		setTimeout(() => text.destroy(), 2000)
	}

	create() {
		const width = this.game.config.width
		const height = this.game.config.height
		const bgWidth = width * 1.3
		const bgHeight = height * 1.3

		this.bgMusic = this.sound.add('bg')
		this.bgMusic.loop = true
		this.bgMusic.volume = 0.3
		this.bgMusic.play()

		this.round = 1
		this.state = 'WAITING'
		this.priorityDirection = ''
		this.timeStealed = 0
		this.enemyCount = 0
		this.isShooting = false
		this.powerupInterval = null

		this.platformGroup = this.add.group().setDepth(3)
		this.powerupGroup = this.add.group().setDepth(2)
		this.playerGroup = this.add.group().setDepth(2)
		this.bombGroup = this.add.group().setDepth(4)
        
		this.raycaster = this.raycasterPlugin.createRaycaster()
		this.raycaster.setBoundingBox(0, 0, bgWidth * 1.5, bgHeight * 1.5)

		this.lights.enable()
		this.lights.setAmbientColor(0xffffff)

		this.physics.add.collider(this.powerupGroup, this.platformGroup)
		this.physics.add.collider(this.playerGroup, this.platformGroup)
		this.physics.add.overlap(
			this.playerGroup,
			this.powerupGroup,
			(player, powerup) => {
				powerup.kill()
				player.rage()
			},
		)

		this.add
			.image(0, 0, `bg/${theme}`)
			.setOrigin(0, 0)
			.setDisplaySize(bgWidth, bgHeight)
			.setScrollFactor(0.15)
			.setTint(0xf0f0f0)
			.setDepth(0)

		this.trail = this.add.graphics()
		this.blackRect = this.add
			.rectangle(0, 0, width, height, 0x000000)
			.setOrigin(0, 0)
			.setScrollFactor(0)
			.setDepth(1100)
			.setAlpha(0.5)

            this.waitingText = this.add
			.text(
				this.game.config.width / 2,
				this.game.config.height / 2,
				'CLICK TO START',
				{
					color: 'white',
					fontSize: '200px',
					fontFamily: 'vt323',
					stroke: 'black',
					strokeThickness: 10,
				},
			)
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0)
			.setDepth(1200)

		this.endText = this.add
			.text(
				this.game.config.width / 2,
				this.game.config.height / 2,
				`${this.timeStealed}s Stealed`,
				{
					color: 'white',
					fontSize: '200px',
					fontFamily: 'vt323',
					stroke: 'black',
					strokeThickness: 10,
				},
			)
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0)
			.setDepth(1200)
			.setAlpha(0)

		this.endText2 = this.add
			.text(
				this.game.config.width / 2,
				this.game.config.height / 2 + 150,
				'NEED MORE?',
				{
					color: 'white',
					fontSize: '100px',
					fontFamily: 'vt323',
					stroke: 'black',
					strokeThickness: 10,
				},
			)
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0)
			.setDepth(1200)
			.setAlpha(0)

		this.timeBarBg = this.add
			.rectangle(0, 0, 1180, 180, 0x000000)
			.setOrigin(0, 0)
			.setScrollFactor(0)
			.setDepth(100)
			.setAlpha(0)

		this.timeBar = this.add
			.rectangle(0, 0, 1180, 160, 0x07fed2)
			.setOrigin(0, 0)
			.setScrollFactor(0)
			.setDepth(101)
			.setAlpha(0)

		this.bombBar = this.add
			.rectangle(0, 160, 1180, 40, 0xffffff)
			.setOrigin(0, 0)
			.setScrollFactor(0)
			.setDepth(102)
			.setAlpha(0)

		this.timeStealedText = this.add
			.text(width - 40, 20, '321', {
				color: 'white',
				fontSize: '200px',
				fontFamily: 'vt323',
				stroke: 'black',
				strokeThickness: 20,
			})
			.setOrigin(1, 0)
			.setScrollFactor(0)
			.setDepth(103)

        // add player character
		this.playablePlayer = this.addPlayer(0)
		this.playablePlayer.onDie = () => {
			this.blackRect.setAlpha(0.5)
		}

		this.playablePlayer.onHit = (damage) => {
			this.timeStealed += damage
		}

        this.cameras.main
			.startFollow(this.playablePlayer)
			.setBounds(0, 0, bgWidth * 1.5, bgHeight * 1.5)

        // add platforms
		for (let i = 0; i < platforms.length; i++) {
			const [x, y, config] = platforms[i]
			const platformObject = new Platform(this, theme, x, y, config)
			this.platformGroup.add(platformObject)
			this.raycaster.mapGameObjects(platformObject.rect)
		}

        // inputs
		this.keyboard = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,RIGHT,DOWN')
		this.input.mouse.disableContextMenu()

		const prioritizeLeft = () => {
			this.priorityDirection = 'L'
		}

		const prioritizeRight = () => {
			this.priorityDirection = 'R'
		}

		this.input.keyboard.on('keydown-A', prioritizeLeft)
		this.input.keyboard.on('keydown-LEFT', prioritizeLeft)
		this.input.keyboard.on('keydown-D', prioritizeRight)
		this.input.keyboard.on('keydown-RIGHT', prioritizeRight)

		this.input.on('pointerdown', (pointer) => {
			if (this.playablePlayer.isKilled) {
                // reload page
				window.location.reload()
			} else if (pointer.rightButtonDown()) {
				this.playablePlayer.bomb()
			} else {
				if (this.state === 'WAITING') {
                    // start play
                    this.powerupInterval = setInterval(() => {
                        this.addPowerup()
                    }, POWERUP_SPAWN_INTERVAL)

					this.blackRect.setAlpha(0)
					this.waitingText.destroy()
					this.spawnEnemy()
					this.state = 'PLAYING'
					this.bombBar.setAlpha(1)
					this.timeBar.setAlpha(1)
					this.timeBarBg.setAlpha(1)
				} else {
                    // shoot
					this.isShooting = true
				}
			}
		})

		this.input.on('pointerup', () => {
			this.isShooting = false
		})
	}

	getTimeBarLength() {
		if (this.playablePlayer.time <= 0) return 0
		if (this.playablePlayer.time > PLAYER_TIME) return 1180
		return (this.playablePlayer.time / PLAYER_TIME) * 1180
	}

	update() {
		if (this.playablePlayer.isKilled) {
			if (this.playablePlayer.isKilled) {
				this.blackRect.setAlpha(0.5)
				this.endText.setAlpha(1)
				this.endText2.setAlpha(1)
				this.endText.text = `${this.timeStealed / 1000}s STEALED!`
				this.bombBar.setAlpha(0)
				this.timeBar.setAlpha(0)
				this.timeBarBg.setAlpha(0)
			}
			return
		}

		const wDown = Phaser.Input.Keyboard.JustDown(this.keyboard.W)
		const upDown = Phaser.Input.Keyboard.JustDown(this.keyboard.UP)
		const aDown = this.keyboard.A.isDown
		const leftDown = this.keyboard.LEFT.isDown
		const sDown = this.keyboard.S.isDown
		const downDown = this.keyboard.DOWN.isDown
		const dDown = this.keyboard.D.isDown
		const rightDown = this.keyboard.RIGHT.isDown

        // update gui
		this.timeBar.width = this.getTimeBarLength()
		this.bombBar.setFillStyle(
			this.playablePlayer.haveBomb ? 0xffffff : 0x000000,
		)
		this.timeStealedText.text = this.timeStealed / 1000

        // update player
		if (this.isShooting) {
			this.playablePlayer.shoot(
				this.input.mousePointer.x + this.cameras.main.worldView.x,
				this.input.mousePointer.y + this.cameras.main.worldView.y,
				this.raycastMap,
			)
		}

		let directionX = 0
		if (this.priorityDirection === 'R' && (dDown || rightDown)) {
			directionX = 1
		} else if (aDown || leftDown) {
			directionX = -1
		} else if (dDown || rightDown) {
			directionX = 1
		}

		this.playablePlayer.move(directionX)

		if (sDown || downDown) {
			this.playablePlayer.slide()
		} else if (wDown || upDown) {
			this.playablePlayer.jump()
		}
	}
}
