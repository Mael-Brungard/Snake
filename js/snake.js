let data = JSON.parse(localStorage.getItem("snakeData"));

document.addEventListener('DOMContentLoaded', () => {
    initialize();
    data = JSON.parse(localStorage.getItem("snakeData"));
});

// Données modifiable
const rows = 15;
const cols = 20;
let tickSpeed = 150;
const Acceleration = true; // la partie accélère quand on mange des baies

// Ne pas toucher
let moved = false;
let berry = false;
let started = false;
let dead = true;
let time = 0;
let score = 0;
let snake;
let lastTail;
let ateBerry;
let berryloc;
let askDirection;
const chronoTick = 100;
const overlay = document.getElementById("overlay");

// Création du terrain
function initialize(){
    const grid = document.getElementById("grid");

    for (let r = 0; r < rows; r++) {
        const row = document.createElement("tr");

        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("td");
            cell.classList.add("cell");
            cell.id = `cell-${r}-${c}`;
            cell.dataset.row = r;
            cell.dataset.col = c;
            row.appendChild(cell);
        }

        grid.appendChild(row);
    }
}
//Démarrage et mise a 0
function Play(){
    const cells = Array.from(document.getElementsByClassName('cell'));
    cells.forEach(element => {
        element.classList.remove('snake');
    });
    snake = {
        direction: "right",
        body: [
            { x: 6, y: 7 },
            { x: 5, y: 7 }, 
            { x: 4, y: 7 }
        ]
    };
    overlay.style.display = 'none';
    deleteBerry();
    dead = false;
    score = 0;
    time = 0;
    started = true;
}
// Déplacement
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") askDirection = "left";
    if (e.key === "ArrowRight") askDirection = "right";
    if (e.key === "ArrowUp") askDirection = "top";
    if (e.key === "ArrowDown") askDirection = "bot";
    if (e.key === "q") askDirection = "left";
    if (e.key === "d") askDirection = "right";
    if (e.key === "z") askDirection = "top";
    if (e.key === "s") askDirection = "bot";
    if (e.key === "Spacebar") pauseGame();
    if (e.key === "Escape") pauseGame();
});

function pauseGame(){
    if(dead) return;
    started = !started;
    const pauseMenu = document.getElementById('pauseMenu');
    pauseMenu.classList.toggle('On');
}

function moveSnake(){
    const direction = snake.direction;
    const head = snake.body[0];
    let newHead = { x: head.x, y: head.y };
    switch (direction){
        case 'left':
            newHead.x--;
            break;
        case 'right':
            newHead.x++;
            break;
        case 'top':
            newHead.y--
            break;
        case 'bot':
            newHead.y++
            break;
    }
    snake.body.unshift(newHead);
    if(!ateBerry){
        lastTail = snake.body.pop();
    }else{
        ateBerry= false;
    }
    
}

// Changement de direction
function turnSnake(){
    const direction = snake.direction;
    if(moved) return;
    if(direction === 'right' || direction === 'left'){
        if(askDirection === 'top' || askDirection === 'bot'){
            moved = true;
            snake.direction = askDirection;
        } 
    }else if(direction === 'top' || direction === 'bot'){
        if(askDirection === 'right' || askDirection === 'left'){
            moved = true;
            snake.direction = askDirection;
        }
    }
}

// Afficher
function drawSnake(){
    const lastTailCell = document.getElementById(`cell-${lastTail.y}-${lastTail.x}`);
    lastTailCell.classList.remove('snake');
    for(cell of snake.body){
        const BodyCell = document.getElementById(`cell-${cell.y}-${cell.x}`);
        BodyCell?.classList.add('snake');
    }
    const BerryCell = document.getElementById(`cell-${berryloc?.y}-${berryloc?.x}`);
    if(BerryCell){
        BerryCell.classList.add('berry');
    }
}

// Verifier les collision
function checkCollisions(){
    const head = snake.body[0];
    if(head.x > cols-1 || head.y > rows-1 || head.x < 0 || head.y <0){
        SnakeDie();
    }
    for(cell of snake.body.slice(1)){
        if(head.x === cell.x && head.y === cell.y){
            SnakeDie();
        }
    }
}

// chrono
function refreshChrono(){
    if(started){
        time += 0.1;
    }
}

// Baie
function spawnBerry(){
    while(!berry){
        const x = getRandomInt(0,cols-1);
        const y = getRandomInt(0,rows-1);
        let collision = false;
        for(cell of snake.body){
            if(x === cell.x && y === cell.y){
                collision = true;
            }
        }
        if (!collision){
            berryloc = {x:x,y:y};
            berry=true;
        }
    }
}
function checkBerryCollision(){
    const head = snake.body[0];
    if(head.x === berryloc?.x && head.y === berryloc?.y){
        eatBerry();
    }
}
function deleteBerry(){
    const BerryCell = document.getElementById(`cell-${berryloc?.y}-${berryloc?.x}`);
    if(BerryCell){
        BerryCell.classList.remove('berry');
        berry = false;
    }
    spawnBerry();
}
function eatBerry(){
    ateBerry = true;
    if(tickSpeed > 75 && Acceleration) tickSpeed -= 20;
    score ++;
    deleteBerry();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fin de Partie
function SnakeDie(){
    started = false;
    dead = true;
    overlay.style.display = 'block';
    save(score);
}

// Affichage Text 
function textRefresh(){
    const chrono = document.getElementById('chrono');
    chrono.innerHTML = `Time : ${time.toFixed(1)}s <br> Score : ${score} // Best Score : ${data?.best}`;

}

// Actualisation
function gameLoop() {
    if(started){
        turnSnake();
        moveSnake();
        checkCollisions();
        drawSnake();
        checkBerryCollision();
        textRefresh();
        moved = false;
    }
}

// Boucle
setInterval(gameLoop, tickSpeed);
setInterval(refreshChrono, chronoTick);

function save(tryScore){
    if(data){
        if(data.best < tryScore) data = {best : tryScore};
        localStorage.setItem("snakeData", JSON.stringify(data));
    }else{
        const firstdata = { best: tryScore };
        localStorage.setItem("snakeData", JSON.stringify(firstdata));
    }
    data = JSON.parse(localStorage.getItem("snakeData"));
}