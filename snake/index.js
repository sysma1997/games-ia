import { Snake } from "./game.js";
import Subject from "../shared/domain/Subject.js";

const canvas = document.getElementById('game');
const snake = new Snake(canvas);
const controlsDesktop = document.getElementById("controlsDesktop");
const controlsMobile = document.getElementById("controlsMobile");
const btnStartGame = document.getElementById("startGame");

const mUp = document.getElementById("btnMUp");
const mLeft = document.getElementById("btnMLeft");
const mRight = document.getElementById("btnMRight");
const mDown = document.getElementById("btnMDown");
const mRestart = document.getElementById("btnMRestart");

// Detecta si es móvil o escritorio y muestra los controles adecuados
function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

document.addEventListener('keydown', e => {
    snake.listenKeyDown(e);
});

Subject.attach("gameOver", (score) => {
    mRestart.style.display = "block";
});

btnStartGame.onclick = () => {
    canvas.style.display = "block";
    if (isMobile()) {
        canvas.width = 800;
        canvas.height = 800;
        controlsDesktop.style.display = "none";
        controlsMobile.style.display = "flex";
    } 
    else {
        canvas.width = 400;
        canvas.height = 400;
        controlsDesktop.style.display = "flex";
        controlsMobile.style.display = "none";
    }
    
    snake.start();
    btnStartGame.style.display = "none";
}

mUp.onclick = () => snake.moveUp();
mDown.onclick = () => snake.moveDown();
mLeft.onclick = () => snake.moveLeft();
mRight.onclick = () => snake.moveRight();
mRestart.onclick = () => {
    snake.restart();
    mRestart.style.display = "none";
}