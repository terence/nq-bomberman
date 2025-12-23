// Simple Bomberman Game in HTML5 Canvas
let canvas, ctx;

const TILE_SIZE = 32;
const MAP_COLS = 15;
const MAP_ROWS = 15;

const PLAYER = 2;
const WALL = 1;
const EMPTY = 0;
const BOMB = 3;
const EXPLOSION = 4;
const ENEMY = 5;

let map = [];
let player, enemies, bombs, explosions;

function initGameState() {
    player = { x: 1, y: 1, alive: true };
    enemies = [{ x: 13, y: 13, alive: true }];
    bombs = [];
    explosions = [];
}

function resetMap() {
    map = [];
    for (let y = 0; y < MAP_ROWS; y++) {
        let row = [];
        for (let x = 0; x < MAP_COLS; x++) {
            if (y === 0 || y === MAP_ROWS - 1 || x === 0 || x === MAP_COLS - 1 || (y % 2 === 0 && x % 2 === 0)) {
                row.push(WALL);
            } else {
                row.push(EMPTY);
            }
        }
        map.push(row);
    }
    map[player.y][player.x] = PLAYER;
    enemies.forEach(e => { if(e.alive) map[e.y][e.x] = ENEMY; });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
            let tile = map[y][x];
            // Draw floor
            ctx.fillStyle = (x + y) % 2 === 0 ? '#2e2e2e' : '#353535';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            if (tile === WALL) {
                // Wall: stone block with shading
                ctx.save();
                ctx.fillStyle = ctx.createLinearGradient(x * TILE_SIZE, y * TILE_SIZE, x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE + TILE_SIZE);
                ctx.fillStyle.addColorStop(0, '#b0b0b0');
                ctx.fillStyle.addColorStop(1, '#888');
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                ctx.restore();
            } else if (tile === PLAYER) {
                // Player: Bomberman with face and helmet
                ctx.save();
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#0ff';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                // Helmet
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2 - 6, TILE_SIZE/3.2, Math.PI, 2 * Math.PI);
                ctx.fillStyle = '#2196f3';
                ctx.fill();
                // Eyes
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2 - 4, y * TILE_SIZE + TILE_SIZE/2, 2, 0, 2 * Math.PI);
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2 + 4, y * TILE_SIZE + TILE_SIZE/2, 2, 0, 2 * Math.PI);
                ctx.fillStyle = '#222';
                ctx.fill();
                // Belt
                ctx.fillStyle = '#e91e63';
                ctx.fillRect(x * TILE_SIZE + 8, y * TILE_SIZE + TILE_SIZE - 12, TILE_SIZE - 16, 4);
                ctx.restore();
            } else if (tile === ENEMY) {
                // Enemy: red round monster with eyes
                ctx.save();
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#e53935';
                ctx.shadowColor = '#f44336';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                // Eyes
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2 - 4, y * TILE_SIZE + TILE_SIZE/2, 2, 0, 2 * Math.PI);
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2 + 4, y * TILE_SIZE + TILE_SIZE/2, 2, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.restore();
            } else if (tile === BOMB) {
                // Bomb: find the bomb object for timer
                let bombObj = bombs.find(b => b.x === x && b.y === y);
                let blink = false;
                let color = '#222';
                if (bombObj) {
                    // Blink faster as timer gets low
                    if (bombObj.timer < 13) {
                        blink = Math.floor(bombObj.timer / 2) % 2 === 0;
                        color = blink ? '#fff' : '#222';
                    } else if (bombObj.timer < 25) {
                        blink = Math.floor(bombObj.timer / 4) % 2 === 0;
                        color = blink ? '#ff5252' : '#222';
                    }
                }
                ctx.save();
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/3, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.shadowColor = '#ff0';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                // Fuse
                ctx.beginPath();
                ctx.moveTo(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2 - 8);
                ctx.lineTo(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2 - 14);
                ctx.strokeStyle = '#ff0';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            } else if (tile === EXPLOSION) {
                // Explosion: animated star burst
                ctx.save();
                ctx.fillStyle = ctx.createRadialGradient(
                    x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, 4,
                    x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2
                );
                ctx.fillStyle.addColorStop(0, '#fffbe7');
                ctx.fillStyle.addColorStop(0.5, '#ffd600');
                ctx.fillStyle.addColorStop(1, '#ff6f00');
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
        }
    }
}

function movePlayer(dx, dy) {
    if (!player.alive) return;
    let nx = player.x + dx;
    let ny = player.y + dy;
    if (map[ny][nx] === EMPTY) {
        map[player.y][player.x] = EMPTY;
        player.x = nx;
        player.y = ny;
        map[player.y][player.x] = PLAYER;
    }
}

document.addEventListener('keydown', e => {
    if (!player.alive) return;
    if (e.key === 'ArrowUp') movePlayer(0, -1);
    if (e.key === 'ArrowDown') movePlayer(0, 1);
    if (e.key === 'ArrowLeft') movePlayer(-1, 0);
    if (e.key === 'ArrowRight') movePlayer(1, 0);
    if (e.key === ' ') placeBomb();
});

function placeBomb() {
    if (bombs.some(b => b.x === player.x && b.y === player.y)) return;
    bombs.push({ x: player.x, y: player.y, timer: 40 });
    map[player.y][player.x] = BOMB;
}

function updateBombs() {
    for (let i = bombs.length - 1; i >= 0; i--) {
        bombs[i].timer--;
        if (bombs[i].timer <= 0) {
            explode(bombs[i].x, bombs[i].y);
            bombs.splice(i, 1);
        }
    }
}

function explode(x, y) {
    let positions = [
        [x, y],
        [x+1, y], [x-1, y],
        [x, y+1], [x, y-1]
    ];
    positions.forEach(([ex, ey]) => {
        if (map[ey] && map[ey][ex] !== WALL) {
            if (map[ey][ex] === ENEMY) {
                let enemy = enemies.find(e => e.x === ex && e.y === ey);
                if (enemy) enemy.alive = false;
            }
            if (map[ey][ex] === PLAYER) player.alive = false;
            map[ey][ex] = EXPLOSION;
            explosions.push({ x: ex, y: ey, timer: 15 });
        }
    });
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].timer--;
        if (explosions[i].timer <= 0) {
            let { x, y } = explosions[i];
            if (map[y][x] === EXPLOSION) map[y][x] = EMPTY;
            explosions.splice(i, 1);
        }
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        let dirs = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];
        let valid = dirs.filter(d => map[enemy.y + d.dy][enemy.x + d.dx] === EMPTY);
        if (valid.length > 0) {
            let move = valid[Math.floor(Math.random() * valid.length)];
            map[enemy.y][enemy.x] = EMPTY;
            enemy.x += move.dx;
            enemy.y += move.dy;
            map[enemy.y][enemy.x] = ENEMY;
        }
        if (enemy.x === player.x && enemy.y === player.y) player.alive = false;

    });
}

function checkWin() {
    if (enemies.every(e => !e.alive)) {
        setTimeout(() => {
            document.getElementById('restartBtn').style.display = '';
            alert('You win!');
        }, 100);
        player.alive = false;
    }
}

function checkLose() {
    if (!player.alive) {
        setTimeout(() => alert('Game Over!'), 100);
    }
}


function gameUpdate() {
    updateBombs();
    updateExplosions();
    updateEnemies();
    checkWin();
    checkLose();
}

function gameDraw() {
    draw();
    requestAnimationFrame(gameDraw);
}


let gameSpeed = 150;
let gameInterval = null;

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameUpdate, gameSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    if (!canvas || !ctx) {
        console.error('Canvas or context not found!');
        return;
    } else {
        console.log('Canvas and context initialized.');
    }

    document.getElementById('speedToggle').addEventListener('click', () => {
        if (gameSpeed === 150) {
            gameSpeed = 60; // fast
        } else {
            gameSpeed = 150; // normal
        }
        startGameLoop();
    });

    function restartGame() {
        console.log('Restarting game...');
        initGameState();
        resetMap();
        startGameLoop();
        document.getElementById('restartBtn').style.display = 'none';
    }
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    console.log('Initializing game state...');
    initGameState();
    resetMap();
    startGameLoop();
    gameDraw();
    console.log('Game started.');
});
