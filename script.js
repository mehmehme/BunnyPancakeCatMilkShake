const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let start = true;

// Fundo da tela inicial
const startBg = new Image();
startBg.src = "images/menu_inicial.png";

//vidas 
const vida = new Image();
vida.src = "images/vida.png";
const vazio= new Image();
vazio.src = "images/perdeu_vida.png";

//parados
const coelho = new Image();
coelho.src = "images/coelho.png"; 
const gato = new Image();
gato.src = "images/gato.png";

//comendo
const coelhoA = new Image();
coelhoA.src = "images/coelho_a.png"; 
const gatoA = new Image();
gatoA.src = "images/gato_a.png";

let c_a = false;
let g_a = false;

// Personagens (quadrados)
const leftChar = { x: 0, y: 50, size: 250, }; 
const rightChar = { x: 580, y: 50, size: 250,}; 

// Itens possíveis
const panqueca = new Image();
panqueca.src = "images/panqueca.png"; 
const milk = new Image();
milk.src = "images/milkshake.png"; 
const temp = new Image();
temp.src = "images/relogio.png";
const bomba = new Image();
bomba.src = "images/bomba.png";
const sizeC = 100;

const gameover = new Image();
gameover.src = "images/gameover_time.png";
const ohno = new Image();
ohno.src = "images/gameover_bomba.png";

const items = [
  { name: "panqueca", color: "orange", correct: "left", image: panqueca, sizeC },
  { name: "milkshake", color: "purple", correct: "right", image: milk, sizeC},
  { name: "relogio", color: "gold", correct: "any", image: temp, sizeC },
  { name: "bomb", color: "gold", correct: "up", image: bomba, sizeC }
];

// Item atual
let currentItem = null;
let itemX = 360;
let itemY = 200;
let moving = false;

// Pontuação e status
let score = 0;
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
let lives = 3;
let timeLeft = 30; 
let gameOver = false;
let bomb = false;

//Novo item
function newItem() {
  const random = Math.floor(Math.random() * items.length);
  currentItem = items[random];

  itemX = 350;
  itemY = -100; // começa fora da tela (acima)
  moving = false;

  // posição final na mesa
  const finalY = 150;

  // animação de queda
  const fallSpeed = 10; 
  const fallInterval = setInterval(() => {
    if (itemY < finalY) {
      itemY += fallSpeed;
    } else {
      itemY = finalY;
      clearInterval(fallInterval);
    }
  }, 16); 
}

newItem();

canvas.addEventListener("click", (e) => {
  if (!start) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const btn = { x: 40, y: canvas.height - 90, width: 220, height: 60 };

  if (
    isHoverStartBtn
  ) {
    startGame();
  }
});

document.getElementById("restartBtn").addEventListener("click", () => {
  // Reseta todas as variáveis principais
  score = 0;
  lives = 3;
  timeLeft = 30;
  gameOver = false;
  c_a = false;
  g_a = false;
  bomb = false;

  // Gera novo item
  newItem();

  // Esconde o botão
  document.getElementById("restartBtn").style.display = "none";
});

// verifica movimento e fim de jogo
document.addEventListener("keydown", (e) => {
  if (gameOver || moving) return;

  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp") {
    moving = true;

    let side = null;
    if (e.key === "ArrowLeft") side = "left";
    else if (e.key === "ArrowRight") side = "right";
    else if (e.key === "ArrowUp") side = "up";

    // Verifica acerto
    if (
      currentItem.correct === side ||
      currentItem.correct === "any"
    ) {
      score++;
      if (currentItem.name === "relogio") timeLeft += 3;
    } else if (currentItem.name === "bomb") {
      bomb = true;
      lives = 0;
    } else {
      lives--;
    }

    // Move visualmente pro lado
    let targetX = itemX;
    let targetY =  itemY;

    if (side === "left") targetX = 120;
    else if (side === "right") targetX = rightChar.x + rightChar.size / 2 - 150;
    else if (side === "up") targetY = -100; // sobe até sair da tela

    const moveInterval = setInterval(() => {
      let reached = false;

      if (side === "left" && itemX > targetX) itemX -= 15;
      else if (side === "right" && itemX < targetX) itemX += 15;
      else if (side === "up" && itemY > targetY) itemY -= 20;
      else reached = true;

      if (reached) {
        clearInterval(moveInterval);

      // Define quem vai abrir o bocão
      if (side === "left") {
        c_a = true;
      } else if (side === "right") {
        g_a = true;
      }

      // Espera 500 ms (meio segundo) para voltar ao normal e gerar novo item
      setTimeout(() => {
        c_a = false;
        g_a = false;
        checkGameOver();
        newItem();
      }, 250);
      }
    }, 16);
  }
});

// Timer
setInterval(() => {
  if (!gameOver) {
    timeLeft--;
    if (timeLeft <= 0) {
      lives = 0;
    checkGameOver();
      updateBestScore();
    }
  }
}, 1000);

let isHoverStartBtn = false; 

// Evento de hover
canvas.addEventListener("mousemove", (e) => {
  if (!start) return; 

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const btnX = 500;
  const btnY = canvas.height - 90;
  const btnW = 220;
  const btnH = 60;

  // verifica se mouse está dentro do botão
  isHoverStartBtn =
    mouseX >= btnX &&
    mouseX <= btnX + btnW &&
    mouseY >= btnY &&
    mouseY <= btnY + btnH;
});

function drawStartScreen() {
  // Fundo cobrindo todo o canvas
  ctx.drawImage(startBg, 0, 0, canvas.width, canvas.height);

  // Botão
  const btnX = 500;
  const btnY = canvas.height - 90;
  const btnW = 220;
  const btnH = 60;
  const radius = 15;

  ctx.fillStyle = isHoverStartBtn? "#914654ff":"#ff5370" ;
  ctx.strokeStyle = "#440606ff";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, radius);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 30px 'Playwrite US Modern'";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("COMEÇAR", btnX + 110, btnY + 40);

  // Retorna área do botão pra detectar clique
  return { x: btnX, y: btnY, width: btnW, height: btnH };
}

// Atualiza recorde
function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
}

// Verifica fim de jogo
function checkGameOver() {
  if (lives <= 0 || timeLeft <= 0) {
    lives = 0;
    gameOver = true;
    updateBestScore();
    document.getElementById("restartBtn").style.display = "block";
  }
}

function startGame() {
  start = false;
  score = 0;
  lives = 3;
  timeLeft = 30;
  gameOver = false;
  bomb = false;
  c_a = false;
  g_a = false;
  newItem();
}

// Loop principal
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (start) {
    drawStartScreen();
  } else {
    draw(); // seu jogo normal
  }

  requestAnimationFrame(update);
}

// Imagens de fundo
const bg = new Image();
bg.src = "images/fundo.png";
const mesa = new Image();
mesa.src = "images/mesa.png";
const banco = new Image();
banco.src = "images/banco.png";

function draw() {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(mesa, 130, 100, 550, 300);
  ctx.drawImage(banco, 50, 250, 150, 150);
  ctx.drawImage(banco, 620, 250, 150, 150);

  // Coelho
  ctx.drawImage(
    c_a? coelhoA : coelho, 
    leftChar.x, leftChar.y, leftChar.size, leftChar.size)

  // Gato
  ctx.drawImage(
    g_a? gatoA : gato, 
    rightChar.x, rightChar.y, rightChar.size, rightChar.size)

  // Item atual
  if (currentItem) {
    ctx.drawImage(currentItem.image, itemX, itemY, currentItem.sizeC, currentItem.sizeC);
  }

  //textos
  ctx.font = "28px 'Playwrite US Modern'";
  ctx.lineWidth = 3;

  // Cor da borda do texto
  ctx.strokeStyle = "#480a17ff";
  ctx.fillStyle = "#ffffffff";

  // Tempo centralizado no topo
  const tempoText = `⏱ ${timeLeft}s`;
  const tempoWidth = ctx.measureText(tempoText).width;
  ctx.strokeText(tempoText, (canvas.width - tempoWidth) / 2+30, 60);
  ctx.fillText(tempoText, (canvas.width - tempoWidth) / 2+30, 60);

  // Vidas no canto esquerdo
  for (let i = 0; i < 3; i++) {
    const x = 5 + i * 60;
    const y = -20;
    if (i < lives) {
      ctx.drawImage(vida, x, y, 90, 90);
    } else {
      ctx.drawImage(vazio, x, y, 90, 90);
    }
  }

  // Pontos
  const pontosText = `Pontos: ${score}`;
  const pontoWidth = ctx.measureText(pontosText).width;
  ctx.strokeText(pontosText,(canvas.width - pontoWidth) / 2+50, 390);
  ctx.fillText(pontosText, (canvas.width - pontoWidth) / 2+50, 390);

  // Recorde (topo direito)
  const recordeText = `Recorde: ${bestScore}`;
  const recordeWidth = ctx.measureText(recordeText).width;
  ctx.strokeText(recordeText, canvas.width - recordeWidth - 20, 40);
  ctx.fillText(recordeText, canvas.width - recordeWidth - 20, 40);

  //gameover por bomba
if (bomb) {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  
  ctx.drawImage(ohno, 0,0, canvas.width, canvas.height);

  ctx.font = "bold 50px 'Playwrite US Modern'";
  ctx.strokeStyle = "#ffffffff";
  ctx.lineWidth = 2;

  ctx.strokeText(pontosText, 120, canvas.height - 20);
  ctx.strokeText("💣 Oh no... 💣", 180, 60);
}
else if (gameOver) {
  // Game over comum
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  
  ctx.drawImage(gameover, 0,0, canvas.width, canvas.height);

  ctx.font = "bold 50px 'Playwrite US Modern'";
  ctx.strokeStyle = "#ffffffff";
  ctx.lineWidth = 2;

  ctx.strokeText(pontosText, 120, canvas.height - 20);
  ctx.strokeText("GAME OVER", 180, 60);
}
}

// Inicia o loop
update();
