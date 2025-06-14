import { Pong } from './game.js';

const canvas = document.getElementById('game');
const btnStart = document.getElementById('btnStartGame');
let pong;

document.addEventListener('DOMContentLoaded', () => {
    pong = new Pong(canvas);
    btnStart.addEventListener('click', () => {
        canvas.style.display = 'block';
        btnStart.style.display = 'none';
        pong.start();
    });
    document.addEventListener('keydown', (e) => pong.listenKeyDown(e));
});
