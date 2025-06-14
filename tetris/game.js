export class Tetris {
    #canvas;
    #ctx;

    #COLS = 10;
    #ROWS = 20;
    #BLOCK = 30;
    #COLORS = [null, '#0ff', '#f00', '#0f0', '#ff0', '#00f', '#f0f', '#fa0'];
    #SHAPES = [
        [],
        [[1, 1, 1, 1]], // I
        [[2, 2], [2, 2]], // O
        [[0, 3, 0], [3, 3, 3]], // T
        [[0, 4, 4], [4, 4, 0]], // S
        [[5, 5, 0], [0, 5, 5]], // Z
        [[6, 0, 0], [6, 6, 6]], // J
        [[0, 0, 7], [7, 7, 7]] // L
    ];
    #score = 0;
    #running = true;
    #dropCounter = 0;
    #dropInterval = 500;
    #lastTime = 0;
    #player = { pos: { x: 0, y: 0 }, matrix: null, color: 1 };
    #arena;

    constructor(canvas) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#arena = this.#createMatrix(this.#COLS, this.#ROWS);
    }

    #createMatrix(w, h) {
        const m = [];
        while (h--) m.push(new Array(w).fill(0));
        return m;
    }
    #collide(arena, player) {
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
    #merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) arena[y + player.pos.y][x + player.pos.x] = val;
            });
        });
    }
    #drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) {
                    this.#ctx.fillStyle = this.#COLORS[val];
                    this.#ctx.fillRect((x + offset.x) * this.#BLOCK, (y + offset.y) * this.#BLOCK, this.#BLOCK - 1, this.#BLOCK - 1);
                }
            });
        });
    }
    #draw() {
        this.#ctx.fillStyle = '#111';
        this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#drawMatrix(this.#arena, { x: 0, y: 0 });
        this.#drawMatrix(this.#player.matrix, this.#player.pos);
        this.#ctx.fillStyle = '#fff';
        this.#ctx.font = '20px Arial';
        this.#ctx.fillText('Score: ' + this.#score, 10, 30);
        if (!this.#running) {
            this.#ctx.font = '32px Arial';
            this.#ctx.fillText('Finish game!', 20, 300);
            this.#ctx.font = '20px Arial';
            this.#ctx.fillText("Press 'Space' to reset game", 10, 340);
        }
    }
    #playerDrop() {
        this.#player.pos.y++;
        if (this.#collide(this.#arena, this.#player)) {
            this.#player.pos.y--;
            this.#merge(this.#arena, this.#player);
            this.#playerReset();
            this.#arenaSweep();
            if (this.#collide(this.#arena, this.#player)) this.#running = false;
        }
        this.#dropCounter = 0;
    }
    #playerMove(dir) {
        this.#player.pos.x += dir;
        if (this.#collide(this.#arena, this.#player)) this.#player.pos.x -= dir;
    }
    #playerRotate() {
        const oldMatrix = this.#player.matrix;
        // Rotar matriz rectangular (sentido horario)
        const m = oldMatrix;
        const rotated = [];
        for (let x = 0; x < m[0].length; ++x) {
            rotated[x] = [];
            for (let y = m.length - 1; y >= 0; --y) {
                rotated[x][m.length - 1 - y] = m[y][x];
            }
        }
        this.#player.matrix = rotated;
        if (this.#collide(this.#arena, this.#player)) {
            this.#player.matrix = oldMatrix; // revertir si hay colisión
        }
    }
    #arenaSweep() {
        let lines = 0;
        outer: for (let y = this.#arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.#arena[y].length; ++x) {
                if (!this.#arena[y][x]) continue outer;
            }
            this.#arena.splice(y, 1);
            this.#arena.unshift(new Array(this.#COLS).fill(0));
            lines++;
        }
        if (lines) this.#score += lines * 10;
    }
    #playerReset() {
        const type = Math.floor(Math.random() * (this.#SHAPES.length - 1)) + 1;
        this.#player.matrix = this.#SHAPES[type].map(row => row.slice());
        this.#player.color = type;
        this.#player.pos.y = 0;
        this.#player.pos.x = Math.floor(this.#COLS / 2) - Math.floor(this.#player.matrix[0].length / 2);
    }
    #update(time = 0) {
        if (!this.#running) { this.#draw(); return; }
        const dt = time - this.#lastTime;
        this.#lastTime = time;
        this.#dropCounter += dt;
        if (this.#dropCounter > this.#dropInterval) this.#playerDrop();
        this.#draw();
        requestAnimationFrame(this.#update.bind(this));
    }

    start() {
        this.#arena = this.#createMatrix(this.#COLS, this.#ROWS);
        this.score = 0;
        this.#running = true;
        this.#playerReset();
        this.#update();
    }
    listenKeyDown(e) {
        if (!this.#running && e.keyCode === 32) {
            this.start();
        }
        if (!this.#running) return;

        if (e.key === 'ArrowLeft') this.#playerMove(-1);
        else if (e.key === 'ArrowRight') this.#playerMove(1);
        else if (e.key === 'ArrowDown') this.#playerDrop();
        else if (e.key === 'ArrowUp') this.#playerRotate();
        else if (e.key === "Space" || e.key === " ") {
            while (!this.#collide(this.#arena, this.#player))
                this.#player.pos.y++;
            this.#player.pos.y--;
            this.#merge(this.#arena, this.#player);
            this.#playerReset();
            this.#arenaSweep();
            if (this.#collide(this.#arena, this.#player)) this.#running = false;
            this.#dropCounter = 0;
            this.#draw();
        }
    }
}