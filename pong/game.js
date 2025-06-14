export class Pong {
    #canvas;
    #ctx;
    #width;
    #height;
    #paddleWidth = 10;
    #paddleHeight = 70;
    #ballRadius = 7;
    #playerY;
    #aiY;
    #playerX;
    #aiX;
    #playerScore = 0;
    #aiScore = 0;
    #ballX;
    #ballY;
    #ballSpeedX;
    #ballSpeedY;
    #running = false;
    #animationId;
    #scoreToWin = 7;
    #lastScored = null;
    #paddleSpeed = 6;
    #ballSpeed = 6;
    #isGameOver = false;
    #touchMove = null;

    constructor(canvas) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#width = canvas.width;
        this.#height = canvas.height;
        this.#reset();
    }

    #reset(ballTo = null) {
        this.#playerX = 20;
        this.#aiX = this.#width - 20 - this.#paddleWidth;
        this.#playerY = (this.#height - this.#paddleHeight) / 2;
        this.#aiY = (this.#height - this.#paddleHeight) / 2;
        this.#ballX = this.#width / 2;
        this.#ballY = this.#height / 2;
        // Ball direction: quien anotó, saca el otro
        let dir = ballTo === 'player' ? -1 : 1;
        this.#ballSpeedX = dir * this.#ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.#ballSpeedY = (Math.random() * 2 - 1) * this.#ballSpeed;
        this.#isGameOver = false;
    }

    #drawRect(x, y, w, h, color) {
        this.#ctx.fillStyle = color;
        this.#ctx.fillRect(x, y, w, h);
    }
    #drawCircle(x, y, r, color) {
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, r, 0, Math.PI * 2);
        this.#ctx.fillStyle = color;
        this.#ctx.fill();
    }
    #drawCenterLine() {
        this.#ctx.save();
        this.#ctx.strokeStyle = '#fff';
        this.#ctx.lineWidth = 3;
        this.#ctx.setLineDash([16, 16]);
        this.#ctx.beginPath();
        this.#ctx.moveTo(this.#width / 2, 0);
        this.#ctx.lineTo(this.#width / 2, this.#height);
        this.#ctx.stroke();
        this.#ctx.setLineDash([]);
        this.#ctx.restore();
    }
    #drawScore() {
        this.#ctx.font = '48px monospace';
        this.#ctx.fillStyle = '#fff';
        this.#ctx.textAlign = 'center';
        this.#ctx.fillText(this.#playerScore, this.#width / 2 - 60, 60);
        this.#ctx.fillText(this.#aiScore, this.#width / 2 + 60, 60);
    }
    #draw() {
        this.#drawRect(0, 0, this.#width, this.#height, '#000');
        this.#drawCenterLine();
        this.#drawRect(this.#playerX, this.#playerY, this.#paddleWidth, this.#paddleHeight, '#fff');
        this.#drawRect(this.#aiX, this.#aiY, this.#paddleWidth, this.#paddleHeight, '#fff');
        this.#drawCircle(this.#ballX, this.#ballY, this.#ballRadius, '#fff');
        this.#drawScore();
        if (this.#isGameOver) {
            this.#ctx.font = '32px monospace';
            this.#ctx.fillStyle = '#fff';
            this.#ctx.textAlign = 'center';
            this.#ctx.fillText('GAME OVER', this.#width / 2, this.#height / 2 - 20);
            this.#ctx.font = '20px monospace';
            this.#ctx.fillText('Presiona Start para reiniciar', this.#width / 2, this.#height / 2 + 20);
        }
    }
    #update() {
        if (!this.#running) { this.#draw(); return; }
        if (this.#isGameOver) { this.#draw(); return; }
        // Ball movement
        this.#ballX += this.#ballSpeedX;
        this.#ballY += this.#ballSpeedY;
        // Wall collision
        if (this.#ballY < this.#ballRadius || this.#ballY > this.#height - this.#ballRadius) {
            this.#ballSpeedY *= -1;
        }
        // Paddle collision (player)
        if (
            this.#ballX - this.#ballRadius < this.#playerX + this.#paddleWidth &&
            this.#ballY > this.#playerY && this.#ballY < this.#playerY + this.#paddleHeight &&
            this.#ballSpeedX < 0
        ) {
            this.#ballSpeedX *= -1;
            // efecto rebote
            let collidePoint = (this.#ballY - (this.#playerY + this.#paddleHeight / 2)) / (this.#paddleHeight / 2);
            let angle = collidePoint * (Math.PI / 4);
            let speed = Math.sqrt(this.#ballSpeedX ** 2 + this.#ballSpeedY ** 2);
            this.#ballSpeedX = speed * Math.cos(angle);
            this.#ballSpeedY = speed * Math.sin(angle);
            if (this.#ballSpeedX > 0) this.#ballSpeedX *= -1;
        }
        // Paddle collision (AI)
        if (
            this.#ballX + this.#ballRadius > this.#aiX &&
            this.#ballY > this.#aiY && this.#ballY < this.#aiY + this.#paddleHeight &&
            this.#ballSpeedX > 0
        ) {
            this.#ballSpeedX *= -1;
            let collidePoint = (this.#ballY - (this.#aiY + this.#paddleHeight / 2)) / (this.#paddleHeight / 2);
            let angle = collidePoint * (Math.PI / 4);
            let speed = Math.sqrt(this.#ballSpeedX ** 2 + this.#ballSpeedY ** 2);
            this.#ballSpeedX = speed * Math.cos(angle);
            this.#ballSpeedY = speed * Math.sin(angle);
            if (this.#ballSpeedX < 0) this.#ballSpeedX *= -1;
        }
        // AI movement (simple follow)
        let aiCenter = this.#aiY + this.#paddleHeight / 2;
        if (aiCenter < this.#ballY - 10) this.#aiY += this.#paddleSpeed;
        else if (aiCenter > this.#ballY + 10) this.#aiY -= this.#paddleSpeed;
        // Score
        if (this.#ballX < 0) {
            this.#aiScore++;
            if (this.#aiScore >= this.#scoreToWin) {
                this.#isGameOver = true;
            } else {
                this.#reset('ai');
            }
        }
        if (this.#ballX > this.#width) {
            this.#playerScore++;
            if (this.#playerScore >= this.#scoreToWin) {
                this.#isGameOver = true;
            } else {
                this.#reset('player');
            }
        }
        this.#draw();
        this.#animationId = requestAnimationFrame(this.#update.bind(this));
    }
    start() {
        this.#playerScore = 0;
        this.#aiScore = 0;
        this.#running = true;
        this.#isGameOver = false;
        this.#reset();
        this.#draw();
        this.#update();
    }
    listenKeyDown(e) {
        if (!this.#running || this.#isGameOver) return;
        if (e.key === 'ArrowUp') {
            this.#playerY -= this.#paddleSpeed * 2;
            if (this.#playerY < 0) this.#playerY = 0;
        } else if (e.key === 'ArrowDown') {
            this.#playerY += this.#paddleSpeed * 2;
            if (this.#playerY > this.#height - this.#paddleHeight) this.#playerY = this.#height - this.#paddleHeight;
        }
    }
}
