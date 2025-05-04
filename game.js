// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 4;
const GAME_SPEED = 150;
const SPEED_BOOST_MULTIPLIER = 0.6; // 40% faster
const QUICK_PRESS_THRESHOLD = 80; // 80 milliseconds between presses
const SPEED_RESET_DELAY = 400; // 400 milliseconds of inactivity to reset
const REQUIRED_QUICK_PRESSES = 3;

// Game variables
let canvas, ctx, score;
let snake, food, direction;
let gameLoop, gameStarted;
let lastKeyPressTimes = [];
let speedBoostTimeout;
let currentGameSpeed = GAME_SPEED;

// Initialize the game
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    score = document.getElementById('score');
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Initialize game state
    resetGame();
};

function resetGame() {
    // Reset speed-related variables
    lastKeyPressTimes = [];
    currentGameSpeed = GAME_SPEED;
    if (speedBoostTimeout) {
        clearTimeout(speedBoostTimeout);
    }
    
    // Initialize snake in the middle of the canvas
    snake = [];
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    
    direction = 'right';
    clearInterval(gameLoop);
    generateFood();
    score.textContent = '0';
    draw();
}

function generateFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // Make sure food doesn't spawn on snake
        let foodOnSnake = false;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                foodOnSnake = true;
                break;
            }
        }
        
        if (!foodOnSnake) break;
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        ctx.fillRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1
        );
    });
    
    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * CELL_SIZE,
        food.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
    );
}

function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check for collisions
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        score.textContent = parseInt(score.textContent) + 10;
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

function isCollision(head) {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // Self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }
    
    return false;
}

function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    alert('Game Over! Press Space to play again.');
}

function handleKeyPress(event) {
    if (event.code === 'Space') {
        gameStarted = true;
        resetGame();
        gameLoop = setInterval(moveSnake, currentGameSpeed);
        return;
    }
    
    if (!gameStarted) return;
    
    const key = event.key;
    const currentTime = performance.now();
    
    // Handle speed boost logic for arrow keys
    if (key.startsWith('Arrow')) {
        lastKeyPressTimes.push(currentTime);
        
        // Only keep the last REQUIRED_QUICK_PRESSES timestamps
        if (lastKeyPressTimes.length > REQUIRED_QUICK_PRESSES) {
            lastKeyPressTimes.shift();
        }
        
        // Check if we have enough quick presses
        if (lastKeyPressTimes.length === REQUIRED_QUICK_PRESSES) {
            let allPressesAreQuick = true;
            
            // Check time differences between consecutive presses
            for (let i = 1; i < lastKeyPressTimes.length; i++) {
                const timeDiff = lastKeyPressTimes[i] - lastKeyPressTimes[i - 1];
                if (timeDiff < QUICK_PRESS_THRESHOLD) {
                    allPressesAreQuick = false;
                    break;
                }
            }
            
            if (allPressesAreQuick && currentGameSpeed === GAME_SPEED) {
                // Apply speed boost
                clearInterval(gameLoop);
                currentGameSpeed = GAME_SPEED * SPEED_BOOST_MULTIPLIER;
                gameLoop = setInterval(moveSnake, currentGameSpeed);
                console.log('Speed boost activated!');
                
                // Clear existing timeout if there is one
                if (speedBoostTimeout) {
                    clearTimeout(speedBoostTimeout);
                }
            }
        }
        
        // Always reset the speed boost timeout on any arrow key press
        if (speedBoostTimeout) {
            clearTimeout(speedBoostTimeout);
        }
        speedBoostTimeout = setTimeout(() => {
            if (currentGameSpeed !== GAME_SPEED) {
                clearInterval(gameLoop);
                currentGameSpeed = GAME_SPEED;
                gameLoop = setInterval(moveSnake, currentGameSpeed);
                console.log('Speed boost deactivated.');
            }
            lastKeyPressTimes = [];
        }, SPEED_RESET_DELAY);
    }
    
    // Prevent reverse direction
    switch (key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
} 