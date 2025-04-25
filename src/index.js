
//мб не нудны точка с запятой
const canvas=document.getElementById("canva");
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//для time
const BONUS_TIMER = 15;
const VELOCITY_TIMER = 30;
let timePassSinceBonus = 0;
let timePassSinceVelocity = 0;
let timeLeftToBonus = BONUS_TIMER;
let timeLeftToSpeedUp = VELOCITY_TIMER;
let time = 0;

const gameState={
    STOPPED: false, 
    player:{score:0,},
    ball:{r:10, x:(canvas.width / 2),y:100,vx:5,vy:5,}, //rad, x,y, speed
    racquet:{w:400,h:50,x:(canvas.width/2 - 200),y:(canvas.height - 60)},
    bonus:{isOn:false, x:(canvas.width/2),y:200,w:20,vx:15,vy:3,},

}


function run(){
    canvas.addEventListener('mousemove',mousemove,false);

    function mousemove(move){
        gameState.racquet.x=move.pageX;
    }
    setInterval(gameLoop,1000/60);
}

function gameLoop() {
    draw()
    update(gameState.ball, gameState.bonus)
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(gameState.ball);
    drawRacquet(gameState.racquet);
    if(gameState.bonus.isOn) {
      drawBonus(gameState.bonus);
    };
    drawScore();
}


//ускоренеи шара
function onTimesUpSpeed(){
    gameState.ball.vx=gameState.ball.vx*1.1; //мб уменьш? 1.5
    gameState.ball.vy=gameState.ball.vy*1.1;
}

//активация бонуса
function BonusActivation(){
    gameState.bonus.isOn=true;
}

//ракетка
function drawRacquet(racquet){
    //ограничения экраном
    if(racquet.x>canvas.width-racquet.w){
        racquet.x=canvas.width-racquet.w;
    }
    else if(racquet.x < 0){
        racquet.x = 0;
    }

    //рисование ракетки
    context.beginPath();
    context.fillStyle = "#660000"; //заливка
    context.rect(racquet.x, racquet.y, racquet.w, racquet.h); //прям
    context.closePath();
    context.fill();
}


//шар
function drawBall(ball) {
    context.beginPath();
    context.fillStyle = "#000000";
    context.arc(ball.x, ball.y, ball.r * 2, 0, Math.PI*2, true); //дуга но круг
    context.closePath();
    context.fill();
}

//бонус
function drawBonus(bonus){
    //данные бонуса
    const bonus_loc = {x: bonus.x, y: bonus.y, w: bonus.w, vx: bonus.vx, vy: bonus.vy};
    //рисование
    context.beginPath(); 
    context.strokeStyle = "#6eb357"; //контурно
    context.lineWidth = 5;


    context.lineTo(bonus_loc.x, bonus_loc.y); //контур, но линия
    context.lineTo(bonus_loc.x, bonus_loc.y - bonus_loc.w);
    context.lineTo(bonus_loc.x, bonus_loc.y + bonus_loc.w);

    context.lineTo(bonus_loc.x, bonus_loc.y);
    context.lineTo(bonus_loc.x - bonus_loc.w, bonus_loc.y);
    context.lineTo(bonus_loc.x + bonus_loc.w, bonus_loc.y);

    context.stroke();
    context.beginPath();

}

function collisionCheck(racquet, ball, bonus){
    const racquetCenter={
        x: (racquet.x + racquet.w) / 2,
        y: (racquet.y + racquet.h) / 2
    };

    //попал шар
    if(ball.y + ball.r + ball.r >=(racquet.y) && ball.vy>0){
        if ((ball.x+ball.r<=racquet.x+racquet.w || ball.x-ball.r<=racquet.x+racquet.w)&&
        (ball.x+ball.r>=racquet.x || ball.x-ball.r>=racquet.x )){
            ball.vy=-1*ball.vy;
            if(ball.x-ball.r<racquetCenter.x){
                ball.vx=-1*ball.vx;
            }
            ball.vx+=1; //ускор
            ball.vy+=1;
        }
    }

    if (bonus.y + bonus.w  >= (racquet.y) && bonus.vy > 0) {
        if ((bonus.x + bonus.w <= racquet.x + racquet.w || bonus.x - bonus.w  <= racquet.x + racquet.w) &&
            (bonus.x + bonus.w  >= racquet.x || bonus.x - bonus.w >= racquet.x)){
                if (!gameState.STOPPED && gameState.bonus.isOn) {
                    gameState.player.score += 15;
                    gameState.bonus.isOn = false;
                    gameState.bonus.x = (canvas.width / 2);
                    gameState.bonus.y = 20;
                    gameState.bonus.vx = 15;
                    gameState.bonus.vy = 3;
                }
        }
      }
}

//счет
function drawScore(){
    context.font ="bold 20px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText('Score: ' + gameState.player.score, 150, 50);
}

function endGame() {
    gameState.STOPPED = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font="50px Arial";
    context.fillText("Game Over! Your Score: " + gameState.player.score, canvas.width / 2 , canvas.height / 2 - 100);
    context.fillText("F5 to Start!", canvas.width / 2, canvas.height / 2);
  }




function update(ball, bonus) {

    timePassSinceBonus += 0.01; //время от бонсуа пропущ
    timeLeftToBonus = BONUS_TIMER - timePassSinceBonus;
  
      // чтоб шло от времени 
    time += 0.015;
    if(time > 1 && !gameState.STOPPED) {
        time = 0;
        gameState.player.score += 1;
    }
 
  

    timePassSinceVelocity+=0.015;
    timeLeftToSpeedUp = VELOCITY_TIMER - timePassSinceVelocity;

    //скорость и бонус выпадения и изм
    if (Math.floor(timeLeftToBonus) === 0) {
        timeLeftToBonus = BONUS_TIMER;
        timePassSinceBonus = 0;
        BonusActivation();
    }

    if (Math.floor(timeLeftToSpeedUp) === 0) {
        timeLeftToSpeedUp = VELOCITY_TIMER;
        timePassSinceVelocity = 0;
        onTimesUpSpeed();
    }

    //скорость шар (измн коорд)
    ball.x+=ball.vx;
    ball.y+=ball.vy;
    //усл проигрыша
    if (ball.y>canvas.height){
        endGame();
        return;
    }

    // изменение стороны пад (nedophysic)
    if(ball.y<ball.r){
        ball.vy=-1*ball.vy;
    }
    if(ball.x>canvas.width-ball.r || ball.x<ball.r){
        ball.vx=-1*ball.vx;
    }

    //бонус падает
    if(gameState.bonus.isOn){
        bonus.x+=bonus.vx;
        bonus.y+=bonus.vy

        //бонус упал, то возвр станд
        if(bonus.y > canvas.height){
            if(!gameState.STOPPED && gameState.bonus.isOn){
                gameState.bonus.isOn = false;
                gameState.bonus.x = (canvas.width / 2);
                gameState.bonus.y = 20;
                gameState.bonus.vx = 15;
                gameState.bonus.vy = 3;
            }
            return;
        }

        //физика бонуса
        if(bonus.y < bonus.w){
            bonus.vy=-1*bonus.vy;
        }
        if(bonus.x>canvas.width-bonus.w || bonus.x<bonus.w){
            bonus.vx=-1*bonus.vx;
        }

    }

    //колл
    collisionCheck(gameState.racquet, gameState.ball, gameState.bonus);
}

run();







