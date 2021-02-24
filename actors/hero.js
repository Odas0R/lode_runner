class Hero extends ActiveActor {
	constructor(x, y) {
		super(x, y, HERO_RUNS_RIGHT);
		this.victoryObjectsAmount = 0;
	}

	animation() {
		// Verifies if the player won the game & shows message
		this.hasEndedTheGame();

		// If touched an evil Actor, decreases lives
		if (!control.lostLevel && this.touchedEvilActor()) {
			this.hide();
			this.decreaseLivesAndLoadlevel();
			this.makeVictoryVerticalActorsInvisible();
			return;
		}

		// this falling handler
		if (this.isFalling) {
			let canFallDown = this.canFallDown();
			if (this.canCatch()) this.collectCollectableObjects();
			if (canFallDown) this.fallDown();
			this.isFalling = canFallDown;
			if (!this.isFalling) this.updateImageAfterFalling();
			if (!this.isFalling && this.canCatch()) this.collectCollectableObjects();
		}

		// Hero Movement/Interactions listeners
		let { action, value } = control.getKey();
		let [dx, dy] = value ? value : [0, 0];
		if (!this.isFalling) {
			this.heroControls(action, dx, dy);
		}
	}

	/**
	 * Controls all the movements of the hero.
	 *
	 * @param {*} action - key action (KEY_LEFT, KEY_RIGHT,...)
	 * @param {*} dx - x coordinate to move
	 * @param {*} dy - y coordinate to move
	 * @returns
	 * @memberof Hero
	 */
	heroControls(action, dx, dy) {
		switch (action) {
			case KEY_SPACE: this.handleSpaceKey(); break;
			case KEY_LEFT: this.handleLeftKey(dx, dy); break;
			case KEY_RIGHT: this.handleRightKey(dx, dy); break;
			case KEY_UP: this.handleUpKey(dx, dy); break;
			case KEY_DOWN: this.handleDownKey(dx, dy); break;
			default: return this;
		}
	}

	/**
	 * Handles the movement of going left.
	 *
	 * @param {*} dx - x coordinate to move
	 * @param {*} dy - y coordinate to move
	 * @memberof Hero
	 */
	handleLeftKey(dx, dy) {
		if (!this.canMoveLeft())
			return;

		if (this.imageName === HERO_ON_LADDER_LEFT || this.imageName === HERO_ON_LADDER_RIGHT) {
			this.setImage(HERO_RUNS_LEFT);
			return;
		}

		if (this.imageName === HERO_RUNS_RIGHT) {
			this.setImage(HERO_RUNS_LEFT);
			return;
		}
		// Change hero image
		this.move(dx, dy);

		if (this.isOnPassiveActorHorizontal()) {
			if (this.imageName === HERO_ON_ROPE_RIGHT)
				this.setImage(HERO_ON_ROPE_LEFT)
			else
				this.setImage(HERO_ON_ROPE_RIGHT);
		} else {
			this.setImage(HERO_RUNS_LEFT);
		}

		if (this.canCatch()) {
			this.collectCollectableObjects();
		}
		if (this.canFallDown() && !this.isOnPassiveActorHorizontal() && !this.hasEvilAt(0, 1)) {
			this.setImage(HERO_FALLS_LEFT);
			this.isFalling = true;
			this.fallDown();
		}
	}

	/**
	 * Handles the movement of going right.
	 *
	 * @param {*} dx - x coordinate to move
	 * @param {*} dy - y coordinate to move
	 * @memberof Hero
	 */
	handleRightKey(dx, dy) {
		if (!this.canMoveRight())
			return;

		if (this.imageName === HERO_ON_LADDER_LEFT || this.imageName === HERO_ON_LADDER_RIGHT) {
			this.setImage(HERO_RUNS_RIGHT);
			return;
		}

		// Better gameplay
		if (this.imageName === HERO_RUNS_LEFT) {
			this.setImage(HERO_RUNS_RIGHT);
			return;
		}

		// Update hero x, y coordinates
		this.move(dx, dy);

		// Change hero image
		if (this.isOnPassiveActorHorizontal()) {
			if (this.imageName === HERO_ON_ROPE_LEFT)
				this.setImage(HERO_ON_ROPE_RIGHT)
			else
				this.setImage(HERO_ON_ROPE_LEFT);
		} else {
			this.setImage(HERO_RUNS_RIGHT);
		}

		if (this.canCatch()) {
			this.collectCollectableObjects();
		}

		if (this.canFallDown() && !this.isOnPassiveActorHorizontal() && !this.hasEvilAt(0, 1)) {
			this.setImage(HERO_FALLS_RIGHT);
			this.isFalling = true;
			this.fallDown();
		}
	}

	/**
	 * Handles the movement of going up.
	 *
	 * @param {*} dx - x coordinate to move
	 * @param {*} dy - y coordinate to move
	 * @returns
	 * @memberof Hero
	 */
	handleUpKey(dx, dy) {

		if (!this.canMoveUp())
			return;

		this.move(dx, dy);

		if (this.isOnPassiveActorVertical()) {
			if (this.imageName === HERO_ON_LADDER_RIGHT) {
				this.setImage(HERO_ON_LADDER_LEFT);
			} else {
				this.setImage(HERO_ON_LADDER_RIGHT);
			}
		}

		if (this.canCatch()) {
			this.collectCollectableObjects();
		}

		if (this.canLoadNextLevel()) {
			this.loadNextLevel();
		}

	}

	/**
	 * Handles the movement of going down.
	 *
	 * @param {*} dx - x coordinate to move
	 * @param {*} dy - y coordinate to move
	 * @memberof Hero
	 */
	handleDownKey(dx, dy) {
		if (!this.canMoveDown())
			return;


		if (this.isOnPassiveActorHorizontal()) {
			if (this.imageName === HERO_ON_ROPE_RIGHT) {
				this.setImage(HERO_RUNS_RIGHT);
			} else {
				this.setImage(HERO_RUNS_LEFT);
			}
		}

		if (this.hasEvilAt(0, 1)) {
			return;
		}

		this.move(dx, dy)

		if (this.isOnPassiveActorVertical()) {
			if (this.imageName === HERO_ON_LADDER_RIGHT) {
				this.setImage(HERO_ON_LADDER_LEFT);
			} else {
				this.setImage(HERO_ON_LADDER_RIGHT);
			}
		}

		if (this.canCatch()) {
			this.collectCollectableObjects();
		}

		if (this.canFallDown() && !this.hasEvilAt(0, 1)) {
			this.isFalling = true;
			this.updateImageOnFalling();
			this.fallDown();
		}
	}

	/**
	 * Handles the hero ability to shoot.
	 *
	 * @memberof Hero
	 */
	handleSpaceKey() {
		// SHOOT
		if (this.imageName === HERO_RUNS_RIGHT || this.imageName === HERO_SHOOTS_RIGHT) {
			if (this.canBreakBrickRight() && this.hasRecoilWhenShootRight()) {
				this.setImage(HERO_SHOOTS_RIGHT);
				this.shootBrickRight();
				this.move(-1, 0);
				if (this.canCatch()) {
					this.collectCollectableObjects();
				}
			} else if (this.canBreakBrickRight() && this.shootsWithoutRecoilRight()) {
				this.setImage(HERO_SHOOTS_RIGHT);
				this.shootBrickRight();
			}
			return;

		}
		else if (this.imageName === HERO_RUNS_LEFT || this.imageName === HERO_SHOOTS_LEFT) {
			if (this.canBreakBrickLeft() && this.hasRecoilWhenShootLeft()) {
				this.setImage(HERO_SHOOTS_LEFT);
				this.shootBrickLeft();
				this.move(1, 0);
				if (this.canCatch()) {
					this.collectCollectableObjects();
				}
			} else if (this.canBreakBrickLeft() && this.shootsWithoutRecoilLeft()) {
				this.setImage(HERO_SHOOTS_LEFT);
				this.shootBrickLeft();
			}
			return;
		}

	}

	/**
	 * If all the colectables that enable the next level have been caught,
	 * show the actor passive of type PassiveActorVictoryVertical to the 
	 * next level
	 *
	 * @memberof Hero
	 */
	collectCollectableObjects() {
		let { world } = control;
		let collectableObject = world[this.x][this.y];
		this.victoryObjectsAmount++;
		collectableObject.collect();
		if (this.collectedAll()) {
			this.openDoorsToNextLevel();
		}
	}

	/**
	 * Checks if all the colectables that enable the next level have been caught
	 *
	 * @returns true: if all the colectables have been caught
	 * @memberof Hero
	 */
	collectedAll() {
		let { passiveVictoryCatchableActors } = control.state;
		return passiveVictoryCatchableActors.length === this.victoryObjectsAmount;
	}

	/**
	 * Make visible the actor passive of type PassiveActorVictoryVertical to the 
	 * next level
	 *
	 * @memberof Hero
	 */
	openDoorsToNextLevel() {
		let { passiveVictoryVerticalActors } = control.state;
		passiveVictoryVerticalActors.map(obj => obj.makeVisible());
	}

	/**
	 * Loads the next level.
	 *
	 * @memberof Hero
	 */
	loadNextLevel() {
		control.currentLevel = control.currentLevel + 1;
		control.totalLives = control.totalLives + 1;
		updateVisualMenNumber(control.totalLives);
		control.loadLevel(control.currentLevel);
	}

	/**
	 * Checks if next level can be loaded
	 *
	 * @returns true: if next level can be loaded
	 * @memberof Hero
	 */
	canLoadNextLevel() {
		return this.y === 0 && this.collectedAll() && this.isOnPassiveActorVertical();
	}

	/**
	 * Updates the image of the Hero on falling
	 * It updates accordingly the previous image
	 * @memberof Hero
	 */
	updateImageOnFalling() {
		if (this.imageName === HERO_RUNS_RIGHT || this.imageName === HERO_ON_ROPE_RIGHT) {
			this.setImage(HERO_FALLS_RIGHT);
			return;
		} else if (this.imageName === HERO_RUNS_LEFT || this.imageName === HERO_ON_ROPE_LEFT) {
			this.setImage(HERO_FALLS_LEFT);
			return;
		}
	}

	/**
	 * Updates the image of the Hero after Falling
	 * It updates accordingly the previous image
	 *
	 * @memberof Hero
	 */
	updateImageAfterFalling() {
		if (this.imageName === HERO_FALLS_RIGHT && this.isOnPassiveActorHorizontal()) {
			this.setImage(HERO_ON_ROPE_RIGHT);
			return;
		} else if (this.imageName === HERO_FALLS_LEFT && this.isOnPassiveActorHorizontal()) {
			this.setImage(HERO_ON_ROPE_LEFT);
			return;
		} else if (this.imageName === HERO_FALLS_RIGHT) {
			this.setImage(HERO_RUNS_RIGHT);
			return;
		} else {
			this.setImage(HERO_RUNS_LEFT);
			return;
		}
	}

	/**
	 * Breaks the right brick.
	 *
	 * @memberof Hero
	 */
	shootBrickRight() {
		// Break right brick
		let { world } = control;
		let { x, y } = this;
		world[x + 1][y + 1].break();
	}

	/**	
	 * Breaks the left brick.
	 *
	 * @memberof Hero
	 */
	shootBrickLeft() {
		//break left brick
		let { world } = control;
		let { x, y } = this;
		world[x - 1][y + 1].break();
	}
	/**
	 *	This method checks the position of an Evil Actor
	 *	that was previously stored in the control.state object
	 *
	 * @returns true if the hero is the same position as the Evil Actor
	 * @memberof Hero
	 */
	touchedEvilActor() {
		const { activeEvilActors } = control.state
		const { x, y } = this;
		for (const evilActor of activeEvilActors) {
			if (evilActor.x === x && evilActor.y === y)
				return true;
		}
		return false;
	}

	hasEndedTheGame() {
		let { currentLevel } = control;
		if (currentLevel === 16 && this.y === 0 && this.isOnPassiveActorVertical()) {
			control.loadLevel(17);
		}
	}

}