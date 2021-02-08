class Robot extends ActiveActorEvil {
	constructor(x, y) {
		super(x, y, ROBOT_RUNS_RIGHT);
		this.dx = 1;
		this.dy = 0;
		this.stuck = false;
		this.hasCoin = false;
		this.dropCoinDelay = 100;
		this.regenerateDelay = 5000;
		this.difficulty = 5;
	}

	animation() {
		// Each 10 seconds (default dropCoinDealy) checks if it can 
		// drop the coin and if it is not possible to drop the coin, 
		// the dropCoinDealy decreases by 20
		if ((this.time % this.dropCoinDelay) === 0 && this.hasCoin) {
			if (this.canDropCoin()) {
				this.dropCoin();
				this.dropCoinDelay = 100;
			} else {
				if (this.dropCoinDelay > 0)
					this.dropCoinDelay = this.dropCoinDelay - 20;
			}
		}

		// Its stuck and has the coin, drops it
		if (this.stuck && this.hasCoin) {
			this.dropCoin();
		}

		// If this touched hero, decrease lives
		if (!control.lostLevel && this.touchedHero()) {
			this.decreaseLivesAndLoadlevel();
			this.makeVictoryVerticalActorsInvisible();
		}

		// this falling handling
		if (this.isFalling && !this.stuck) {
			let canFallDown = this.canEvilFallDown()
			if (canFallDown) this.fallDown();
			this.isFalling = canFallDown;
			if (!this.isFalling) this.updateImageAfterFalling();
			if (this.canEvilBeStuck() && !this.hasEvilAt(0, 1)) {
				this.stuck = true;
				this.regenerateEvil(this.regenerateDelay);
			}
		}

		// If it isnt falling, move.
		if (!this.isFalling && !control.lostLevel && this.time % this.difficulty === 0) {
			this.moveTowardsHero();
		}
	}

	/**
	 * Pathfinder of the Robot. 
	 * An good algorithm implementation would be Dijkstras Algorithm.
	 * This is not the best option.
	 *
	 * @memberof Robot
	 */
	moveTowardsHero() {
		let { x, y } = hero;

		if (this.stuck) {
			return;
		}

		// hero is to the right of the robot
		if (x > this.x) {
			// Hero is on the right
			if (this.y < y) {
				// HERO IS BELOW
				if (!this.isOnPassiveActorVerticalBelow() || this.isOnPassiveActorHorizontal()) {
					return this.moveRight();
				} else if (this.isOnPassiveActorVerticalBelow()) {
					return this.moveDown();
				}
			} else if (this.y > y) {
				// HERO IS ON TOP
				if (this.isOnPassiveActorVertical()) return this.moveUp();
				if (this.isOnPassiveActorVerticalBelow() && !this.isOnPassiveActorVertical()) return this.moveRight();
				if (!this.isOnPassiveActorVerticalBelow() || this.isOnPassiveActorHorizontal()) {
					return this.moveRight();
				}
			} else {
				// HERO IS AT THE SAME Y
				this.moveRight();
			}

		} else if (x < this.x) {
			// Hero is on the left
			if (this.y < y) {
				// HERO IS BELOW
				if (!this.isOnPassiveActorVerticalBelow() || this.isOnPassiveActorHorizontal()) {
					return this.moveLeft();
				} else if (this.isOnPassiveActorVerticalBelow()) {
					return this.moveDown();
				}
			}
			else if (this.y > y) {
				// HERO IS ON TOP
				if (this.isOnPassiveActorVertical()) return this.moveUp();
				if (this.isOnPassiveActorVerticalBelow() && !this.isOnPassiveActorVertical()) return this.moveLeft();
				if (!this.isOnPassiveActorVerticalBelow() || this.isOnPassiveActorHorizontal()) {
					return this.moveLeft();
				}
			} else {
				// HERO IS AT THE SAME Y
				this.moveLeft();
			}
		} else {
			// HERO IS AT THE SAME X
			if (this.y < y) {
				// HERO IS BELOW
				if (this.isOnPassiveActorHorizontal()) return this.moveDown();
				if (this.isOnPassiveActorVertical()) {
					return this.moveDown();
				}
			}
			else if (this.y > y) {
				// HERO IS ON TOP
				if (this.isOnPassiveActorVertical()) {
					this.moveUp();
				}
			}
		}
	}





	/**
	 * Handles the right movement of the robot.
	 *
	 * @memberof Robot
	 */
	moveRight() {
		if (!this.canMoveRight() || control.worldActive[this.x + 1][this.y] instanceof ActiveActorEvil || this.hasEvilAt(0, 1) && !control.worldActive[this.x][this.y + 1].stuck) {
			return;
		}

		this.move(1, 0);

		if (this.isOnPassiveActorHorizontal()) {
			if (this.imageName === ROBOT_ON_ROPE_LEFT)
				this.setImage(ROBOT_ON_ROPE_RIGHT)
			else
				this.setImage(ROBOT_ON_ROPE_LEFT);
		} else {
			this.setImage(ROBOT_RUNS_RIGHT);
		}

		if (this.canCatch() && !this.hasCoin) {
			this.collectCoin();
		}

		if (this.canEvilFallDown()) {
			this.setImage(ROBOT_FALLS_RIGHT);
			this.stuck = this.canEvilBeStuck();
			if (!this.stuck) {
				this.isFalling = true;
				this.fallDown();
				return;
			}
			this.fallDown();
			this.regenerateEvil(this.regenerateDelay)
		}
	}

	/**
	 * Handles the left movement of the robot.
	 *
	 * @memberof Robot
	 */
	moveLeft() {
		let evilBelow = control.worldActive[this.x][this.y + 1];
		if (!this.canMoveLeft() || this.hasEvilAt(-1, 0) || this.hasEvilAt(0, 1) && !evilBelow.stuck) {
			return;
		}

		this.move(-1, 0);


		if (this.isOnPassiveActorHorizontal()) {
			if (this.imageName === ROBOT_ON_ROPE_RIGHT)
				this.setImage(ROBOT_ON_ROPE_LEFT)
			else
				this.setImage(ROBOT_ON_ROPE_RIGHT);
		} else {
			this.setImage(ROBOT_RUNS_LEFT);
		}

		if (this.canCatch() && !this.hasCoin) {
			this.collectCoin();
		}

		if (this.hasEvilAt(0, 1)) {
			return;
		}

		if (this.canEvilFallDown()) {
			this.setImage(ROBOT_FALLS_LEFT);
			this.stuck = this.canEvilBeStuck();
			if (!this.stuck) {
				this.isFalling = true;
				this.fallDown();
				return;
			}
			this.fallDown();
			this.regenerateEvil(this.regenerateDelay);
		}
	}

	/**
	 * Handles the robot movement of going up.
	 *
	 * @memberof Robot
	 */
	moveUp() {
		if (!this.canMoveUp() || control.worldActive[this.x][this.y - 1] instanceof ActiveActorEvil)
			return;


		this.move(0, -1);
		if (this.canCatch() && !this.hasCoin) {
			this.collectCoin();
		}
		if (this.isOnPassiveActorVertical()) {
			if (this.imageName === ROBOT_ON_LADDER_RIGHT) {
				this.setImage(ROBOT_ON_LADDER_LEFT);
			} else {
				this.setImage(ROBOT_ON_LADDER_RIGHT);
			}
		}
	}

	/**
	 * Handles robot movement of going down
	 *
	 * @memberof Robot
	 */
	moveDown() {
		if (!this.canMoveDown() || control.worldActive[this.x][this.y + 1] instanceof ActiveActorEvil || this.hasEvilAt(0, 1))
			return;



		if (this.isOnPassiveActorHorizontal()) {
			if (this.imageName === ROBOT_ON_ROPE_RIGHT) {
				this.setImage(ROBOT_RUNS_RIGHT);
			} else {
				this.setImage(ROBOT_RUNS_LEFT);
			}
		}

		this.move(0, 1);

		if (this.isOnPassiveActorVertical()) {
			if (this.imageName === ROBOT_ON_LADDER_RIGHT) {
				this.setImage(ROBOT_ON_LADDER_LEFT);
			} else {
				this.setImage(ROBOT_ON_LADDER_RIGHT);
			}
		}

		if (this.canCatch() && !this.hasCoin) {
			this.collectCoin();
		}

		if (this.canEvilFallDown()) {
			this.isFalling = true;
			this.updateImageOnFalling();
			this.fallDown();
		}
	}

	/**
	 *	Update the robot image on falling.
	 *
	 * @memberof Robot
	 */
	updateImageOnFalling() {
		if (this.imageName === ROBOT_RUNS_RIGHT || this.imageName === ROBOT_ON_ROPE_RIGHT) {
			this.setImage(ROBOT_FALLS_RIGHT);
			return;
		} else if (this.imageName === ROBOT_RUNS_LEFT || this.imageName === ROBOT_ON_ROPE_LEFT) {
			this.setImage(ROBOT_FALLS_LEFT);
			return;
		}
	}

	/**
	 * Update the robot image after falling
	 *
	 * @memberof Robot
	 */
	updateImageAfterFalling() {
		if (this.imageName === ROBOT_FALLS_RIGHT && this.isOnPassiveActorHorizontal()) {
			this.setImage(ROBOT_ON_ROPE_RIGHT);
			return;
		} else if (this.imageName === ROBOT_FALLS_LEFT && this.isOnPassiveActorHorizontal()) {
			this.setImage(ROBOT_ON_ROPE_LEFT);
			return;
		} else if (this.imageName === ROBOT_FALLS_RIGHT) {
			this.setImage(ROBOT_RUNS_RIGHT);
			return;
		} else {
			this.setImage(ROBOT_RUNS_LEFT);
			return;
		}
	}

	/**
	 * Steals the coin from the hero.
	 *
	 * @memberof Robot
	 */
	collectCoin() {
		let { world } = control;
		// Grabbed the coin
		this.hasCoin = true;
		world[this.x][this.y] = empty;
	}

	/**
	 * This method verify if it's possible to spawn 
	 * the stolen coin in the x, y of the this robot
	 *
	 * @memberof Robot
	 */
	canDropCoin() {
		let { world } = control;
		let worldItem = world[this.x][this.y];
		let worldItemUnder = world[this.x][this.y + 1];
		let worldItemRight = world[this.x + 1][this.y];
		let worldItemLeft = world[this.x - 1][this.y];
		if ((worldItemUnder instanceof PassiveActorSolid || worldItemUnder instanceof PassiveActorVertical) &&
			!(worldItem instanceof PassiveActorHorizontal) &&
			!(worldItem instanceof PassiveActorVertical && worldItemUnder instanceof PassiveActorVertical) &&
			!(worldItemLeft instanceof PassiveActorVertical) &&
			!(worldItemRight instanceof PassiveActorVertical)) {
			return true;
		}
		return false;
	}

	/**
	 * Spawns the coin near the robot.
	 * 
	 * If the robot is stuck, spawns on top of him
	 * Else spawns on the right side
	 * @memberof Robot
	 */
	dropCoin() {
		let { world } = control;
		if (this.stuck) {
			world[this.x][this.y - 1] = new Gold(this.x, this.y - 1);
		} else if (this.x === WORLD_WIDTH - 1) {
			world[this.x - 1][this.y] = new Gold(this.x, this.y - 1);
		} else {
			world[this.x + 1][this.y] = new Gold(this.x + 1, this.y);
		}
		this.hasCoin = false;
	}


}