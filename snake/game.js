export class Snake {
    #canvas;
    #ctx;

    #grid = 20;
    #snake = [{ x: 160, y: 200 }];
    #dx = this.#grid;
    #dy = 0;
    #food = { x: 320, y: 200 };
    #score = 0;
    #running = true;
    #changeDirection = false;
    #foodPulse = 0;

    constructor(canvas) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
    }

    #getRandomPosition() {
        return {
            x: Math.floor(Math.random() * (this.#canvas.width / this.#grid)) * this.#grid,
            y: Math.floor(Math.random() * (this.#canvas.height / this.#grid)) * this.#grid
        };
    }

    #draw() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        // Fondo con degradado
        let grad = this.#ctx.createLinearGradient(0, 0, 0, this.#canvas.height);
        grad.addColorStop(0, '#222');
        grad.addColorStop(1, '#333');
        this.#ctx.fillStyle = grad;
        this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

        // Sombra para la serpiente
        this.#ctx.save();
        this.#ctx.shadowColor = '#0f0';
        this.#ctx.shadowBlur = 10;
        // Dibujar serpiente con bordes redondeados
        this.#ctx.fillStyle = '#0f0';
        this.#snake.forEach((part, i) => {
            this.#ctx.beginPath();
            this.#ctx.arc(part.x + this.#grid / 2, 
                part.y + this.#grid / 2, 
                this.#grid / 2 - 2, 0, 
                2 * Math.PI);
            this.#ctx.fill();
            // Cabeza con borde más claro
            if (i === 0) {
                this.#ctx.lineWidth = 3;
                this.#ctx.strokeStyle = '#bfff00';
                this.#ctx.stroke();
            }
        });
        this.#ctx.restore();

        // Comida animada (pulso)
        this.#foodPulse += 0.1;
        let pulse = 2 + Math.sin(this.#foodPulse) * 2;
        this.#ctx.save();
        this.#ctx.shadowColor = '#f00';
        this.#ctx.shadowBlur = 15;
        this.#ctx.beginPath();
        this.#ctx.arc(this.#food.x + this.#grid / 2, 
            this.#food.y + this.#grid / 2, 
            this.#grid / 2 - 2 + pulse, 
            0, 
            2 * Math.PI);
        this.#ctx.fillStyle = `hsl(${Math.abs(Math.sin(this.#foodPulse)) * 30 + 350}, 100%, 50%)`;
        this.#ctx.fill();
        this.#ctx.restore();

        // Puntaje
        this.#ctx.fillStyle = '#fff';
        this.#ctx.font = '18px Arial';
        this.#ctx.fillText('Score: ' + this.#score, 10, 20);

        // Overlay de game over
        if (!this.#running) {
            this.#ctx.save();
            this.#ctx.globalAlpha = 0.7;
            this.#ctx.fillStyle = '#000';
            this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.#ctx.globalAlpha = 1;
            this.#ctx.fillStyle = '#fff';
            this.#ctx.font = '32px Arial';
            this.#ctx.textAlign = 'center';
            this.#ctx.fillText('Finish!', this.#canvas.width / 2, 160);
            this.#ctx.font = '20px Arial';
            this.#ctx.fillText('Final score: ' + this.#score, this.#canvas.width / 2, 200);
            this.#ctx.fillText("Press 'Space' to reset game", this.#canvas.width / 2, 230);
            this.#ctx.restore();
        }
    }

    #moveSnake() {
        const head = { 
            x: this.#snake[0].x + this.#dx, 
            y: this.#snake[0].y + this.#dy 
        };
        // Check collision with walls
        if (head.x < 0 || 
            head.x >= this.#canvas.width || 
            head.y < 0 || 
            head.y >= this.#canvas.height) {
            this.#running = false;
            return;
        }
        // Check collision with self
        if (this.#snake.some(part => part.x === head.x && part.y === head.y)) {
            this.#running = false;
            return;
        }
        this.#snake.unshift(head);
        // Check if food eaten
        if (head.x === this.#food.x && head.y === this.#food.y) {
            this.#score++;
            this.#food = this.#getRandomPosition();
            this.#foodPulse = 0; // Reinicia animación de comida
        } else {
            this.#snake.pop();
        }
    }

    #gameLoop() {
        if (!this.#running) {
            this.#draw();
            return;
        }
        this.#moveSnake();
        this.#draw();
        if (this.#changeDirection) this.#changeDirection = false;
        setTimeout(() => this.#gameLoop(), 100);
    }

    #reset() {
        this.#snake = [{ x: 160, y: 200 }];
        this.#dx = this.#grid;
        this.#dy = 0;
        this.#food = this.#getRandomPosition();
        this.#score = 0;
        this.#running = true;
        this.#changeDirection = false;
    }

    start() {
        this.#draw();
        this.#gameLoop();
    }
    listenKeyDown(e) {
        if (e.key === 'ArrowUp' && this.#dy === 0 && !this.#changeDirection) {
            this.#dx = 0;
            this.#dy = -this.#grid;
        }
        else if (e.key === 'ArrowDown' && this.#dy === 0 && !this.#changeDirection) {
            this.#dx = 0;
            this.#dy = this.#grid;
        }
        else if (e.key === 'ArrowLeft' && this.#dx === 0 && !this.#changeDirection) {
            this.#dx = -this.#grid;
            this.#dy = 0;
        }
        else if (e.key === 'ArrowRight' && this.#dx === 0 && !this.#changeDirection) {
            this.#dx = this.#grid;
            this.#dy = 0;
        }

        if (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") this.#changeDirection = true;

        if (e.keyCode === 32 && !this.#running) {
            this.#reset();
            this.#gameLoop();
        }
    }
}