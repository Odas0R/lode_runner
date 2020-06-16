// =================================================
// =============== RESET GAME POPUP ================
// =================================================

function resetGamePopup(k) {
	// Cannot display reset game popup when lost the level
	if (control.lostLevel || control.wonGame) {
		return;
	}
	k.cancelBubble = true;

	const canvasLayer = document.getElementsByClassName("canvas-layer")[0];
	const resetButtons = document.getElementsByClassName("reset-buttons")[0];
	const message = document.getElementById("message");

	if (control.isOnReset) {
		resetButtons.classList.add("hide");
		canvasLayer.removeAttribute("style");
		message.classList.add("hide");
		message.classList.remove("fix-reset");
		message.textContent = "";
		control.isOnReset = false;
		control.resumeAnimations();
	} else {
		resetButtons.classList.remove("hide")
		canvasLayer.setAttribute("style", "background-color: black");
		message.classList.remove("hide");
		message.classList.add("fix-reset")
		message.textContent = "Do you want to reset the game?"
		control.isOnReset = true;
		control.stopAnimations();
	}
}

// Reset Game Util Functions (Used in method keydown() at GameControl Class)
function fakeClickReset(key, k) {
	if (!control.isOnReset) return;
	k.cancelBubble = true;
	const yesReset = document.getElementById("yes-reset");
	const noReset = document.getElementById("no-reset");

	if (key === 13) {
		yesReset.click()
		return;
	}

	if (key === 27) {
		noReset.click();
		return;
	}
}

// =========================================================
// =============== RESUME AND PAUSE ANIMATION ==============
// =========================================================

function resumeAndPauseAnimations(k) {
	if (control.wonGame) return;
	k.cancelBubble = true;
	// Cannot pause or resume animations on reset mode
	const startButton = document.getElementById("play");
	const { value } = startButton;
	if (value === "PAUSE") {
		control.stopAnimations();
		startButton.value = "RESUME";
	} else {
		control.resumeAnimations();
		startButton.value = "PAUSE";
	}
}

// ========================================================
// =============== TOGGLE TEXT ANIMATION ==================
// ========================================================

function toggleAnimation(message) {
	const messageElm = document.getElementById("message");
	const levelLostAnimation = document.getElementById("level-lost");
	messageElm.textContent = message;
	if (levelLostAnimation.classList.contains("hide")) {
		levelLostAnimation.classList.remove("hide");
		messageElm.classList.remove("hide");
	} else {
		levelLostAnimation.classList.add("hide");
		messageElm.classList.add("hide");
	}
}

// ============================================================
// =============== TOGGLE ANIMATIONS DISPLAY ==================
// ============================================================

function gameOverDisplay() {
	// Start animation
	toggleAnimation("Game Over");
	// Reset Game Variables
	setTimeout(() => {

		control.lostLevel = false;
		control.resetGame();
		// End animation
		toggleAnimation("Game Over");
	}, 3000)
}

function loseLevelDisplay() {
	// Add animation on hero death
	toggleAnimation("You Lose");
	// Load the current level when animation is done
	setTimeout(() => {
		let { activeEvilActors } = control.state;
		activeEvilActors.map(obj => obj.hide());
		control.loadLevel(control.currentLevel);
		toggleAnimation("You Lose");
		control.lostLevel = false;
	}, 3000)
}

function wonGameDisplay() {
	const canvasLayer = document.getElementsByClassName("canvas-layer")[0];
	const message = document.getElementById("message");

	canvasLayer.setAttribute("style", "background-color: black");
	message.classList.remove("hide");
	message.classList.add("fix-won");
	message.innerHTML = `Congratulations! <p> You've won! </p>`
	control.wonGame = true;
	control.stopAnimations();
}

function submitLevelInput(event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		const levelInput = document.getElementById("level");
		let { value } = levelInput;
		if (value) {
			control.loadLevel(parseInt(value));
		}
	}
}
// =================================================================
// =============== UPDATE VISUAL SCORE, LIVES, LEVEL ===============
// =================================================================


function updateVisualScore(value) {
	// reset control variables
	const scoreElem = document.getElementById("score-value");
	// 0 is used for score resetc
	let digitsOfTotalScore;
	value === 0 ? digitsOfTotalScore = 0 : digitsOfTotalScore = getLength(value);
	switch (digitsOfTotalScore) {
		case 0: scoreElem.textContent = '0000000'; return;
		case 3: scoreElem.textContent = `0000${value}`; return;
		case 4: scoreElem.textContent = `000${value}`; return;
		case 5: scoreElem.textContent = `00${value}`; return;
		case 6: scoreElem.textContent = `0${value}`; return;
		case 7: scoreElem.textContent = `${value}`; return;
		default: return;
	}
}

function updateVisualMenNumber(number) {
	const menAmountElem = document.getElementById("men-value");
	const digitsOfTotalMen = getLength(number);
	switch (digitsOfTotalMen) {
		case 1: menAmountElem.textContent = `00${number}`; return;
		case 2: menAmountElem.textContent = `0${number}`; return;
		case 3: menAmountElem.textContent = `${number}`; return;
		default: return;
	}
}

function updateVisualLevelNumber(number) {
	const menAmountElem = document.getElementById("level-value");
	const digitsOfTotalMen = getLength(number);
	switch (digitsOfTotalMen) {
		case 1: menAmountElem.textContent = `00${number}`; return;
		case 2: menAmountElem.textContent = `0${number}`; return;
		case 3: menAmountElem.textContent = `${number}`; return;
		default: return;
	}
}


// =================================================
// =============== EVENT LISTENERS =================
// =================================================

const setupEventListeners = () => {
	// NAV BAR
	const openNav = document.getElementById("open-nav");
	openNav.addEventListener("click", () => {
		document.getElementById("mySidebar").style.width = "400px";
		document.getElementById("side-bar-icon").style.marginLeft = "400px";
		document.getElementsByClassName("how-to-play")[0].style.display = "inline";
	}, false)

	const closeNav = document.getElementById("close-nav");
	closeNav.addEventListener("click", () => {
		document.getElementsByClassName("how-to-play")[0].style.display = "none";
		document.getElementById("mySidebar").style.width = "0";
		document.getElementById("side-bar-icon").style.marginLeft = "0";
	}, false)


	// RESET GAME BUTTONS

	const yesReset = document.getElementById("yes-reset");
	const noReset = document.getElementById("no-reset");
	[yesReset, noReset].forEach(btn => {
		btn.addEventListener("click", (e) => {
			let choice = e.srcElement.value;
			const resetButtons = document.getElementsByClassName("reset-buttons")[0];
			const canvasLayer = document.getElementsByClassName("canvas-layer")[0];
			const message = document.getElementById("message");
			canvasLayer.removeAttribute("style");
			resetButtons.classList.add("hide")
			message.classList.add("hide");
			message.classList.remove("fix-reset");
			message.textContent = "";
			if (choice === "YES") {
				control.resetGame();
				control.resumeAnimations();
				control.isOnReset = false;
				return;
			}
			control.resumeAnimations();
			control.isOnReset = false;
		}, false)
	})
}



// ===================================================
// =============== AUXILIAR FUNCTIONS ================
// ===================================================

function getLength(number) {
	return number.toString().length;
}