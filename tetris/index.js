import { Tetris } from "/tetris/game.js";

const canvas = document.getElementById('game');
const startGame = document.getElementById("btnStartGame");

let tetris;

document.addEventListener('DOMContentLoaded', () => {
    tetris = new Tetris(canvas);
    startGame.addEventListener('click', () => {
        canvas.style.display = 'block';
        startGame.style.display = 'none';
        tetris.start();
    });
    document.addEventListener('keydown', (e) => tetris.listenKeyDown(e));
});
