// Definição do canvas e contexto
const canvasEl = document.querySelector("canvas");
const canvasCtx = canvasEl.getContext("2d");
const gapX = 10;
let gameRunning = false;

// Variáveis para desenho
const lineWidth = 5;
const racketLine = 20;

// Objeto do campo
const field = {
    w: window.innerWidth,
    h: window.innerHeight,
    draw: function () {
        canvasCtx.fillStyle = "#000";
        canvasCtx.fillRect(0, 0, this.w, this.h);
    }
};

// Objeto de pontuação
const score = {
    human: 0,
    computer: 0,

    increaseHuman: function () {
        this.human++;

        if (this.human > 10) {
            this.winner();
            stopGame();
        }
    },

    increaseComputer: function () {
        this.computer++;

        if (this.computer > 10) {
            this.gameover();
            stopGame();
        }
    },

    draw: function () {
        canvasCtx.font = "bold 72px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.textBaseline = "top";
        canvasCtx.fillStyle = "#fff";
        canvasCtx.fillText(this.human, field.w / 4, 50);
        canvasCtx.fillText(this.computer, field.w / 2 + field.w / 4, 50);
    },

    gameover: function () {
        canvasCtx.font = "bold 42px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.textBaseline = "center";
        canvasCtx.fillStyle = "#fff";
        canvasCtx.fillText("GAME OVER", field.w / 2, field.h / 2);
        // Redirecionar para a tela inicial após 3 segundos
        setTimeout(() => {
            window.location.reload();  // Recarregar a página para reiniciar o jogo
        }, 3000);
    },

    winner: function () {
        canvasCtx.font = "bold 42px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.textBaseline = "center";
        canvasCtx.fillStyle = "#fff";
        canvasCtx.fillText("PARABÉNS!! Você venceu!!", field.w / 2, field.h / 2);
        // Redirecionar para a tela inicial após 3 segundos
        setTimeout(() => {
            window.location.reload();  // Recarregar a página para reiniciar o jogo
        }, 3000);
    }
};

// Raquete esquerda
const leftPaddle = {
    x: gapX,
    y: field.h / 2,
    w: racketLine,
    h: 100,
    _move: function () {
        // Limitar a movimentação da raquete à altura da tela
        if (mouse.y - this.h / 2 >= 0 && mouse.y + this.h / 2 <= field.h) {
            this.y = mouse.y - this.h / 2;
        } else if (mouse.y - this.h / 2 < 0) {
            this.y = 0;
        } else if (mouse.y + this.h / 2 > field.h) {
            this.y = field.h - this.h;
        }
    },
    draw: function () {
        canvasCtx.fillStyle = "#fff";
        canvasCtx.fillRect(this.x, this.y, this.w, this.h);
        this._move();
    }
};

// Raquete direita
const rightPaddle = {
    x: field.w - racketLine - gapX,
    y: field.h / 2,
    w: racketLine,
    h: 100,
    speed: 6,
    _move: function () {
        // Previsão da trajetória da bola
        let targetY = ball.y;

        // Se a bola estiver se movendo para a direita
        if (ball.directionX > 0) {
            // Calcular onde a bola vai colidir com a raquete direita
            let timeToCollision = (this.x - ball.x + ball.r) / (ball.directionX * ball.speed);
            targetY = ball.y + ball.directionY * ball.speed * timeToCollision;
        }

        // Mover a raquete em direção à posição da bola
        if (this.y + this.h / 2 < targetY) {
            this.y += this.speed;
        } else if (this.y + this.h / 2 > targetY) {
            this.y -= this.speed;
        }

        // Verificar limites superior e inferior da raquete
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.h > field.h) {
            this.y = field.h - this.h;
        }
    },
    speedUp: function () {
        this.speed++;
    },
    draw: function () {
        canvasCtx.fillStyle = "#fff";
        canvasCtx.fillRect(this.x, this.y, this.w, this.h);
        this._move();
    }
};

// Bola
const ball = {
    x: field.w / 2,
    y: field.h / 2,
    r: 14,
    speed: 6,
    directionX: 1,
    directionY: 1,

    _calcPosition: function () {
        // Verifica se o jogador 1 - humano fez um ponto
        if (this.x > field.w - this.r - rightPaddle.w - gapX) {
            // Calcula a posição da raquete no eixo y
            if (
                this.y + this.r > rightPaddle.y &&
                this.y - this.r < rightPaddle.y + rightPaddle.h
            ) {
                // Rebate a bola
                this._reverseX();
            } else {
                // Marcar o ponto
                score.increaseHuman();
                this._pointUp();
            }
        }

        // Verificar se o jogador 2 (computador) fez o ponto
        if (this.x < this.r + leftPaddle.w + gapX) {
            if (
                this.y + this.r > leftPaddle.y &&
                this.y - this.r < leftPaddle.y + leftPaddle.h
            ) {
                // Rebate a bola
                this._reverseX();
            } else {
                // Marca o ponto
                score.increaseComputer();
                this._pointUp();
            }
        }

        // Calcula a posição vertical da bola na tela
        if (
            (this.y - this.r < 0 && this.directionY < 0) ||
            (this.y > field.h - this.r && this.directionY > 0)
        ) {
            this._reverseY();
        }
    },

    _reverseX: function () {
        this.directionX *= -1;
    },

    _reverseY: function () {
        this.directionY *= -1;
    },

    _speedUp: function () {
        this.speed += 3;
    },

    _pointUp: function () {
        this.x = field.w / 2;
        this.y = field.h / 2;

        this._reverseX();
        this._speedUp();
        rightPaddle.speedUp();
    },

    _move: function () {
        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;
    },

    draw: function () {
        canvasCtx.fillStyle = "#fff";
        canvasCtx.beginPath();
        canvasCtx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        canvasCtx.fill();
        this._calcPosition();
        this._move();
    }
};

// Configurações iniciais do canvas
const setup = () => {
    canvasEl.width = canvasCtx.width = window.innerWidth;
    canvasEl.height = canvasCtx.height = window.innerHeight;
};

// Função de desenho dos elementos do jogo
const draw = () => {
    // Desenho do campo
    field.draw();

    // Pontuação
    score.draw();

    // Raquete esquerda
    leftPaddle.draw();

    // Raquete direita
    rightPaddle.draw();

    // Bola
    ball.draw();
};

// Função principal para atualizar e desenhar os elementos do jogo
const main = () => {
    if (gameRunning) {
        animateFrame(main);
        draw();
    }
};

// Inicialização do mouse
const mouse = {
    x: 0,
    y: 0
};

// Evento de movimento do mouse para controlar a raquete esquerda
canvasEl.addEventListener("mousemove", (e) => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

// Evento de teclado para controlar a raquete esquerda
document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
        mouse.y -= 20; // Move a raquete para cima
    } else if (e.key === "ArrowDown") {
        mouse.y += 20; // Move a raquete para baixo
    }
});

// Função para suportar requestAnimationFrame em vários navegadores
window.animateFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };

// Início do jogo
setup();

// Função para iniciar o jogo
const startGame = () => {
    gameRunning = true;
    main();
};

// Função para parar o jogo
const stopGame = () => {
    gameRunning = false;
};

// Iniciar o jogo ao clicar no botão de iniciar
const buttonStart = document.querySelector(".start");
buttonStart.addEventListener("click", () => {
    document.querySelector(".container").style.display = "none";
    document.querySelector("canvas").style.display = "block";
    startGame();
});

// Evento de Enter para iniciar o jogo
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        document.querySelector(".container").style.display = "none";
        document.querySelector("canvas").style.display = "block";
        startGame();
    }
});
