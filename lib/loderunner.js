// =======================================================
// =============== GLOBAL VARIABLES ======================
// =======================================================

let empty, hero, control;

// ===========================================================
// =============== GAME CONTROL CLASS ========================
// ===========================================================

class GameControl {
	constructor() {
		control = this;
		this.key = 0;
		this.time = 0;
		this.animations = null;

		// Game Variables
		this.totalPoints = 0;
		this.totalLives = 5;
		this.currentLevel = 1;
		this.lostLevel = false;
		this.isOnReset = false;
		this.wonGame = false;

		// Canvas
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.state = {};
		this.loadLevel(1);
		this.setupEvents();
		this.resetVisuals();
	}

	/**
	 * Create a new array to be drawn with 
	 * current level objects
	 *
	 * @returns matrix full of emptys
	 * @memberof GameControl
	 */
	createMatrix() { // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for (let x = 0; x < WORLD_WIDTH; x++) {
			let a = new Array(WORLD_HEIGHT);
			for (let y = 0; y < WORLD_HEIGHT; y++)
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}

	/**
	 * Cleans the Canvas and the World.
	 * Loads the game level.
	 * Generates a new state of the level.
	 * Hides the old hero if it exists.
	 * Updates the Visual Level Number.
	 *
	 * @param {*} level - level of the game
	 * @memberof GameControl
	 */
	loadLevel(level) {
		if (level === 17) {
			this.cleanCanvasAndWorld();
			wonGameDisplay();
			return;
		}

		if (level < 1 || level > MAPS.length)
			fatalError("Invalid level " + level)
		// Reset the items of the posterior level
		this.state = this.createInitialState();
		this.currentLevel = level;
		updateVisualLevelNumber(level);
		this.cleanCanvasAndWorld();
		// Load the level
		let map = MAPS[level - 1];  // -1 because levels start at 1
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				// x/y reversed because map stored by lines
				let actor = GameFactory.actorFromCode(map[y][x], x, y);
				// Local Variables
				let name = actor.__proto__.__proto__.constructor.name;
				let state = this.state;
				let value = actor;
				// Update the state
				this.state = this.updateCurrentState(name, value, state);
			}
	}

	/**
	 * Handles the Key Down Event.
	 *
	 * @returns {Object} - An object containing an action and a value
	 * @memberof GameControl
	 */
	getKey() {
		let k = control.key;
		control.key = 0;
		const nullAction = { action: null, value: null };
		switch (k) {
			case 37: case 79: case 74: return { action: KEY_LEFT, value: [-1, 0] };
			case 38: case 81: case 73: return { action: KEY_UP, value: [0, -1] };
			case 39: case 80: case 76: return { action: KEY_RIGHT, value: [1, 0] };
			case 40: case 65: case 75: return { action: KEY_DOWN, value: [0, 1] };
			case 32: return { action: KEY_SPACE, value: null };
			default: return nullAction;
		};
	}

	/**
	 * Events initialization.
	 *
	 * @memberof GameControl
	 */
	setupEvents() {
		addEventListener("keydown", this.keyDownEvent, false);
		this.animations = setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	}

	/**
	 * Resume the animations (setInterval).
	 * Updates the this.animations.
	 *
	 * @memberof GameControl
	 */
	resumeAnimations() {
		this.animations = setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	}

	/**
	 * Clears the Interval this.animations on the window object.
	 *
	 * @memberof GameControl
	 */
	stopAnimations() {
		window.clearInterval(this.animations);
		this.animations = null;
	}

	/**
	 * Runs all the animation method in the ActiveActors
	 *
	 * @memberof GameControl
	 */
	animationEvent() {
		control.time++;
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				let a = control.worldActive[x][y];
				if (a.time < control.time) {
					a.time = control.time;
					a.animation();
				}
			}
	}

	/**
	 * Updates the key of the control variable.
	 * Handles animations keypress's listeners.
	 *
	 * @param {Number} k
	 * @memberof GameControl
	 */
	keyDownEvent(k) {
		let { keyCode } = k;
		control.key = keyCode
		/*
			Window Listeners

			This listeners had to be separated from the getKey() because
			it deals with animations.
			When the animations stop, otherwise, control.time, the getKey()
			wouldn't return anything.
		*/
		let { isOnReset } = control;
		switch (keyCode) {
			case 27: if (isOnReset)
				fakeClickReset(27, k);
			else
				resumeAndPauseAnimations(k);
				break;
			case 82: resetGamePopup(k); break;
			case 13:
				fakeClickReset(13, k); break;

			default: break;
		}
	}

	/**
	 * This methods updates the state of the current level.
	 * Example: All ActorEvil in the current level,
	 * 					All the ActorVictoryCatchabale Objects,
	 * 					All the ActorVictoryVertial Objects...
	 *
	 * Can be added more in needed!
	 * (Just add the attribute in the createInitialState()
	 * And the case in this method...)
	 * 
	 *
	 * @param {String} name - attribute name in the object state
	 * @param {Actor} value - object to be added
	 * @param {Object} state - current state
	 * @returns {Object} - returns the state on default
	 * @memberof GameControl
	 */
	updateCurrentState(name, value, state) {
		switch (name) {
			case "PassiveActorVictoryVertical":
				return fillHiddenVictoryVerticalObj("passiveVictoryVerticalActors", value, state);
			case "PassiveActorVictoryCatchable":
				return fillObj("passiveVictoryCatchableActors", value, state);
			case "ActiveActorEvil":
				return fillObj("activeEvilActors", value, state);
			// Don't add all other Objects
			default: return this.state;
		}

		/**
		 *	Fill the state with the hidden victory vertical actors
		 *
		 * @returns {Object} - new state
		 */
		function fillHiddenVictoryVerticalObj(nameInState, value, state) {
			if (!value.visible) {
				state[nameInState].push(value);
				return state;
			}
			return state;
		}
		/**
		 *	Fill the state with the actors from the current level
		 *
		 * @returns {Object} - new state
		 */
		function fillObj(nameInState, value, state) {
			state[nameInState].push(value);
			return state;
		}
	}

	/**
	 * This method creates the initial state to be filled up
	 * on the loadLevel().
	 *
	 * @returns {Object} - initial state
	 * @memberof GameControl
	 */
	createInitialState() {
		return {
			passiveVictoryVerticalActors: [],
			passiveVictoryCatchableActors: [],
			activeEvilActors: [],
			brokenBricks: [],
		}
	}

	/**
	 * This method resets the whole app, restarting at level 1.
	 *
	 * @memberof GameControl
	 */
	resetGame() {
		const canvas = document.getElementById("canvas1");
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		// Clear the anterior level
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(1);
		// Reset Points
		this.totalPoints = 0;
		this.totalLives = 5;
		this.resetVisuals();
	}

	/**
	 * This method reset the Visuals of the Game:
	 * 
	 * - Visual Score; (0000000)
	 * - Level Number; (001)
	 * - Total Men Lives; (005)
	 * 
	 * @memberof GameControl
	 */
	resetVisuals() {
		updateVisualScore(0);
		updateVisualLevelNumber(1);
		updateVisualMenNumber(5);
	}

	/**
	 * Cleans the canvas and resets the worlds
	 *
	 * @returns {Object} - oldX, oldY of the old hero
	 * @memberof GameControl
	 */
	cleanCanvasAndWorld() {
		// Clear the canvas
		const canvas = document.getElementById("canvas1");
		const context = canvas.getContext("2d");
		// Clear the canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		// Reset the current world
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
	}
}

/**
 * This method loads the game when the body HTML element loads.
 */
const loadGame = () => {
	const startButton = document.getElementById("play");
	GameImages.loadAll(() => {
		new GameControl();
		startButton.value = "PAUSE";
	});
	// Setup All Custom Listeners
	setupEventListeners();
}

