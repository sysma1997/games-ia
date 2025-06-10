import { Snake } from "./game.js";

const canvas = document.getElementById('game');
const snake = new Snake(canvas);

document.addEventListener('keydown', e => {
    snake.listenKeyDown(e);
});

const btnStartGame = document.getElementById("startGame");
btnStartGame.onclick = () => {
    canvas.style.display = "block";
    snake.start();
    btnStartGame.style.display = "none";
};