const gameContainer = document.getElementById('game-container');
const car = document.getElementById('car');
const gameOverText = document.getElementById('game-over');
const scoreUI = document.getElementById('score-ui');
const barrierUI = document.getElementById('barrier-ui');
const startMenu = document.getElementById('start-menu');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');
const finalScoreText = document.getElementById('final-score');
const tutorial = document.getElementById('tutorial');
const highScoreText = document.getElementById('high-score');
const pauseMenu = document.getElementById('pause-menu'); // Added for pause menu
const resumeBtn = document.getElementById('resume-btn');

resumeBtn.addEventListener('click', togglePause);


let carLane = 2; // Starting lane (0-indexed)
let barrierCount = 3;
let barrierActive = false;
let transition = false;
let score = 0;
let speed = 5; // Initial game speed
let scoreIncrementRate = 1; // Points increment per frame
const speedIncreaseThreshold = 100; // Points at which speed increases
const baseObstacleSpawnInterval = 2000; // Base obstacle interval in ms
const basePowerUpSpawnInterval = 10000; // Base power-up interval in ms

let numberOfLanes = 5; // Dynamic lane count
let lanes = [];
let obstacles = [];
let powerUps = [];
let gameRunning = false;
let gamePaused = false;

let backgroundPositionY = 0;

let gameLoop;
let obstacleInterval, powerUpInterval;

// Load high score from localStorage
let highScore = localStorage.getItem('highScore') || 0;
highScoreText.textContent = `High Score: ${highScore}`;

// Show tutorial if it's the player's first time


// Event listeners for game controls
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
pauseBtn.addEventListener('click', togglePause);

document.addEventListener('keydown', (e) => {
  if (!gameRunning || gamePaused) return;

  if (e.key === 'ArrowLeft' && carLane > 0) {
    moveCarToLane(carLane - 1);
  } else if (e.key === 'ArrowRight' && carLane < numberOfLanes - 1) {
    moveCarToLane(carLane + 1);
  } else if (e.key === ' ' && barrierCount > 0 && !barrierActive) {
    activateBarrier();
  }
});

// Start the game
function startGame() {
  score = 0;
  barrierCount = 3;
  barrierActive = false;
  carLane = Math.floor(numberOfLanes / 2); // Center car
  speed = 5; // Reset speed
  gameRunning = true;
  gamePaused = false;

  startMenu.style.display = 'none';
  gameOverText.style.display = 'none';
  pauseMenu.style.display = 'none'; // Hide pause menu
  gameContainer.style.display = 'flex';

  
  document.getElementById('game-ui').style.display = 'flex';
  pauseBtn.innerHTML = '&#124; &#124;';

  initializeDynamicLanes();
  moveCarToLane(carLane);
  updateScoreUI();
  updateBarrierUI();
  clearGameElements();

  backgroundPositionY = 0;
  gameContainer.style.backgroundPositionY = '0px';

  clearIntervals();
  startGameIntervals();


}

// Restart the game
function restartGame() {
  clearIntervals();
  startGame();
}

// Toggle pause/resume
function togglePause() {
  if (gameRunning) {
    gamePaused ? resumeGame() : pauseGame();
  }
}

// Pause the game
function pauseGame() {
  gamePaused = true;
  pauseBtn.innerHTML = '&#9658;';
  pauseMenu.style.display = 'flex'; // Show pause menu
  clearIntervals();
}

// Resume the game
function resumeGame() {
  gamePaused = false;
  pauseBtn.innerHTML = '&#124; &#124;';
  pauseMenu.style.display = 'none'; // Hide pause menu
  startGameIntervals();
}

// Start game intervals for spawning and updating
function startGameIntervals() {
  obstacleInterval = setInterval(spawnObstacle, baseObstacleSpawnInterval / speed);
  powerUpInterval = setInterval(spawnPowerUp, basePowerUpSpawnInterval / speed);
  gameLoop = setInterval(gameLoopHandler, 50); // Main game loop
}

// Main game loop handler
function gameLoopHandler() {
  if (gameRunning && !gamePaused) {
    moveElements();
    moveBackground();
    incrementScore();
  }
}

// Increment score and increase speed at thresholds
function incrementScore() {
  score += scoreIncrementRate;
  updateScoreUI();

  if (score % speedIncreaseThreshold === 0) {
    increaseGameSpeed();
  }
}

// Update score UI
function updateScoreUI() {
  scoreUI.textContent = `Score: ${score}`;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreText.textContent = `High Score: ${highScore}`;
  }
}

// Increase game speed and dynamically adjust intervals
function increaseGameSpeed() {
  speed += 1;

  clearInterval(obstacleInterval);
  clearInterval(powerUpInterval);

  obstacleInterval = setInterval(spawnObstacle, baseObstacleSpawnInterval / speed);
  powerUpInterval = setInterval(spawnPowerUp, basePowerUpSpawnInterval / speed);
}

// Initialize dynamic lanes
function initializeDynamicLanes() {
  lanes = [];
  const laneWidth = gameContainer.offsetWidth / numberOfLanes;
  for (let i = 0; i < numberOfLanes; i++) {
    lanes.push(laneWidth * i + laneWidth / 2 - car.offsetWidth / 2);
  }
}

// Move car to specific lane
function moveCarToLane(lane) {
  carLane = lane;
  transition = true;
  car.style.left = `${lanes[carLane]}px`;
  setTimeout(()=> transition = false, 200);
}

// Spawn obstacles
function spawnObstacle() {
  const random = Math.floor(Math.random() * 3)
  if(random === 0){
    const lane = Math.floor(Math.random() * numberOfLanes);
  const type = Math.floor(Math.random() * 3); // Randomize type: 0 - rock, 1 - hole, 2 - wood
  const obstacle = document.createElement('div');
  obstacle.classList.add('obstacle');

  // Assign type class
  if (type === 0) {
    obstacle.classList.add('rock');
  } else if (type === 1) {
    obstacle.classList.add('hole');
  } else {
    obstacle.classList.add('wood');
  }

  obstacle.style.left = `${lanes[lane]}px`;
  obstacle.style.top = '0px';
  gameContainer.appendChild(obstacle);
  obstacles.push(obstacle);
  }

  
}

// Spawn power-ups
function spawnPowerUp() {
  const random = Math.floor(Math.random() * 10);
  if(random === 0){
    const lane = Math.floor(Math.random() * numberOfLanes);
  const powerUp = document.createElement('div');
  powerUp.classList.add('power-up');
  powerUp.style.left = `${lanes[lane]}px`;
  powerUp.style.top = '0px';
  gameContainer.appendChild(powerUp);
  powerUps.push(powerUp);
  }

  
}

// Move obstacles and power-ups
function moveElements() {
  obstacles.forEach((obstacle, index) => {
    const top = parseInt(obstacle.style.top);
    obstacle.style.top = `${top + speed}px`;

    if (top > 600) {
      obstacle.remove();
      obstacles.splice(index, 1);
    } else if (checkCollision(obstacle, car)) {
      if (transition){
        
      }
      else if (barrierActive) {
        deactivateBarrier();
        obstacle.remove();
        obstacles.splice(index, 1);
      } else {
        endGame();
      }
    }
  });

  powerUps.forEach((powerUp, index) => {
    const top = parseInt(powerUp.style.top);
    powerUp.style.top = `${top + speed}px`;

    if (top > 500) {
      powerUp.remove();
      powerUps.splice(index, 1);
    } else if (checkCollision(powerUp, car)) {
      powerUp.remove();
      powerUps.splice(index, 1);
      if(barrierCount<3){
        barrierCount++;
        updateBarrierUI();
      }
      
    }
  });
}

// Move the background
function moveBackground() {
  backgroundPositionY += speed;
  gameContainer.style.backgroundPositionY = `${backgroundPositionY}px`;
}

// Check for collision
function checkCollision(element, car) {
  const carRect = car.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return !(
    carRect.right < elementRect.left ||
    carRect.left > elementRect.right ||
    carRect.bottom - 8 < elementRect.top ||
    carRect.top +8 > elementRect.bottom
  );
}

// Activate the barrier
function activateBarrier() {
  barrierActive = true;
  car.classList.add('powered-up');
  barrierCount--;
  updateBarrierUI();
  setTimeout(deactivateBarrier, (basePowerUpSpawnInterval *5)/ speed);
}

// Deactivate the barrier
function deactivateBarrier() {
  barrierActive = false;
  car.classList.remove('powered-up');
}

// Update barrier UI
function updateBarrierUI() {
  barrierUI.textContent = `Barriers: ${barrierCount}`;
}

// Clear game elements
function clearGameElements() {
  obstacles.forEach((obstacle) => obstacle.remove());
  obstacles.length = 0;
  powerUps.forEach((powerUp) => powerUp.remove());
  powerUps.length = 0;
}

// End the game
function endGame() {
  gameRunning = false;
  gameOverText.style.display = 'flex';
  finalScoreText.textContent = `Score: ${score}`;
  startMenu.style.display = 'none';
  document.getElementById('game-ui').style.display = 'none';
  clearIntervals();
}

// Clear all intervals
function clearIntervals() {
  clearInterval(obstacleInterval);
  clearInterval(powerUpInterval);
  clearInterval(gameLoop);
}

// Add event listeners for pausing when the window loses focus
window.addEventListener('blur', () => {
  if (gameRunning && !gamePaused) {
    pauseGame();
  }
});

// Add event listener for when the window regains focus (optional, to inform the user)
window.addEventListener('focus', () => {
  if (gamePaused) {
    pauseMenu.style.display = 'flex'; // Keep the pause menu visible
  }
});

document.body.addEventListener('click', (e) => {

  
  
  // Check if the click is outside the gameContainer

  
  
  if (gameRunning && !gamePaused && e.target == e.currentTarget) {

    
    pauseGame();
  }
});

let lastTouchTime = 0;

// Event listeners for touch events on mobile
gameContainer.addEventListener('touchstart', handleTouchStart);
gameContainer.addEventListener('touchend', handleTouchEnd);
gameContainer.addEventListener('dblclick', handleDoubleTap);

// Variables to store touch start positions
let touchStartX = 0;
let touchStartY = 0;

// Handle touch start (detect swipe start)
function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

// Handle touch end (detect swipe and double tap)
function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  // Detect swipe direction
  const swipeThreshold = 15; // Minimum distance to detect a swipe

  // Horizontal swipe (left or right)
  if (Math.abs(touchEndX - touchStartX) > swipeThreshold && Math.abs(touchEndY - touchStartY) < swipeThreshold) {
    if (touchEndX < touchStartX && carLane > 0) { // Swipe left
      moveCarToLane(carLane - 1);
    } else if (touchEndX > touchStartX && carLane < numberOfLanes - 1) { // Swipe right
      moveCarToLane(carLane + 1);
    }
  }

  // Detect double-tap for barrier activation
  const currentTime = new Date().getTime();
  if (currentTime - lastTouchTime < 300) { // 300ms to detect a double tap
    if (barrierCount > 0 && !barrierActive) {
      activateBarrier();
    }
  }
  lastTouchTime = currentTime;
}

// Handle double-tap directly on the screen for barrier activation
function handleDoubleTap(e) {
  if (barrierCount > 0 && !barrierActive) {
    activateBarrier();
  }
}