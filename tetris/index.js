const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const COLS = 10, ROWS = 20, BLOCK = 30;
const COLORS = [null, '#0ff', '#f00', '#0f0', '#ff0', '#00f', '#f0f', '#fa0'];
const SHAPES = [
    [],
    [[1, 1, 1, 1]], // I
    [[2, 2], [2, 2]], // O
    [[0, 3, 0], [3, 3, 3]], // T
    [[0, 4, 4], [4, 4, 0]], // S
    [[5, 5, 0], [0, 5, 5]], // Z
    [[6, 0, 0], [6, 6, 6]], // J
    [[0, 0, 7], [7, 7, 7]] // L
];
let arena = createMatrix(COLS, ROWS);
let score = 0;
let running = true;
let dropCounter = 0, dropInterval = 500, lastTime = 0;
let player = { pos: { x: 0, y: 0 }, matrix: null, color: 1 };

function createMatrix(w, h) {
    const m = [];
    while (h--) m.push(new Array(w).fill(0));
    return m;
}

function collide(arena, player) {
    const m = player.matrix, o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) arena[y + player.pos.y][x + player.pos.x] = val;
        });
    });
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                ctx.fillStyle = COLORS[val];
                ctx.fillRect((x + offset.x) * BLOCK, (y + offset.y) * BLOCK, BLOCK - 1, BLOCK - 1);
            }
        });
    });
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    if (!running) {
        ctx.font = '32px Arial';
        ctx.fillText('Finish game!', 20, 300);
        ctx.font = '20px Arial';
        ctx.fillText("Press 'Space' to reset game", 10, 340);
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        if (collide(arena, player)) running = false;
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function playerRotate() {
    const m = player.matrix;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
    }
    m.forEach(row => row.reverse());
    if (collide(arena, player)) {
        m.forEach(row => row.reverse());
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
            }
        }
    }
}

function arenaSweep() {
    let lines = 0;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (!arena[y][x]) continue outer;
        }
        arena.splice(y, 1);
        arena.unshift(new Array(COLS).fill(0));
        lines++;
    }
    if (lines) score += lines * 10;
}

function playerReset() {
    const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    player.matrix = SHAPES[type].map(row => row.slice());
    player.color = type;
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
}

function update(time = 0) {
    if (!running) { draw(); return; }
    const dt = time - lastTime;
    lastTime = time;
    dropCounter += dt;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (!running && e.keyCode === 32) {
        arena = createMatrix(COLS, ROWS);
        score = 0;
        running = true;
        playerReset();
        update();
    }
    if (!running) return;
    if (e.key === 'ArrowLeft') playerMove(-1);
    else if (e.key === 'ArrowRight') playerMove(1);
    else if (e.key === 'ArrowDown') playerDrop();
    else if (e.key === 'ArrowUp') playerRotate();
});

playerReset();
update();