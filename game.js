let score = 0;
let lives = 50;

let enemies = [];
let checkpoints = [];
let towers = [];

let gameWidth = document.documentElement.clientWidth;
let gameHeight = document.documentElement.clientHeight;

let g = hexi(gameWidth, gameHeight, setup);

g.scaleToWindow();
g.backgroundColor = '#004d00';

function setup(){
    console.log('Starting setup');
    let spawnInterval = 2500;
    
    let spawnEnemies = function(){

        enemies.push(new Enemy());

        // uh detta gick visst å göra på två sätt ^^
        g.wait(spawnInterval, spawnEnemies);
        // g.wait(spawnInterval, () => spawnEnemies());

        if(spawnInterval > 200)
            spawnInterval -= 100;
    }

    checkpoints.push(new Checkpoint(300,200))
    checkpoints.push(new Checkpoint(650,100));
    checkpoints.push(new Checkpoint(250,550));
    checkpoints.push(new Checkpoint(1000,200));
    checkpoints.push(new Checkpoint(550,600));
    checkpoints.push(new Checkpoint(1100,600));
   

    drawLineBetweenCheckpoints(checkpoints);

    spawnEnemies();    

    g.state = play;
}

g.pointer.tap = () => {
    
    let x = g.pointer.x;
    let y = g.pointer.y;

    console.log('click at (', x, y, ')');

    let tower = new BombTower(x, y);
    towers.push(tower);
}


g.start();

function BombTower(x, y){

    let fireRate = 500;
    let health = 500;
    let range = 250;
    let size = 25;


    let tower = Tower(x, y, size, range, health, fireRate);

    return tower;


}

function Tower(x, y, size, range, health, fireRate){

    let tower = g.circle(size, 'blue', 'black', 2, x-size/2, y-size/2);
    tower.range = g.circle(range, 'black', 'red', 5);
    tower.putCenter(tower.range);
    tower.range.alpha = 0.1;
    tower.bullets = [];
    tower.targets = [];
    tower.fireRate = fireRate;
    tower.lastShotTime = 0;
    tower.health = health;

    tower.selectTarget = function(){

        let target = tower.targets[0];

        if(target != null){
            for(let i in tower.targets){

                // console.log(i);
            }
            tower.shoot(target);
        }

        tower.targets = [];
    }

    tower.shoot = function(enemy){
        let now = new Date();
        if( tower.lastShotTime + tower.fireRate <= now.getTime()){
            tower.lastShotTime = now.getTime();
            let angle = g.angle(this, enemy);
            let speed = 10;

            g.shoot(tower, 
                    angle,
                    tower.halfWidth,
                    tower.halfHeight,
                    g.stage,
                    speed,
                    tower.bullets,
                    () => g.circle(10, 'red', 'black', 2)
                );
        }    
    }
    return tower;
}

function Checkpoint(x, y){
    let checkpoint = g.circle(0, 'black', 'black', 0, x, y);
    checkpoint.setPivot(0.5, 0.5);

    return checkpoint;
}

function drawLineBetweenCheckpoints(checkpoints){
    let prevCheckpoint = null;

    checkpoints.forEach( checkpoint => {
        
        let checkpointMarker = g.circle(102, '#CC9966', 'black', 0, checkpoint.x - 51, checkpoint.y - 51);


        if(prevCheckpoint != null){
            g.line('#CC9966', 100, checkpoint.x, checkpoint.y, prevCheckpoint.x, prevCheckpoint.y);
        }
        prevCheckpoint = checkpoint;
    });
}

function Enemy(x, y){
    
    x = checkpoints[0].x;
    y = checkpoints[0].y;

    let enemy = g.circle(15, "pink", "purple", 5, x, y);

    let healthBar = g.rectangle(75, 10, "black");
    enemy.healthBar = healthBar;
    enemy.addChild(healthBar);
    enemy.putTop(healthBar);
    healthBar.y -= 10;
    
    let inner = g.rectangle(75, 10, "green");
    healthBar.inner = inner;
    healthBar.addChild(inner);

    

    enemy.hp = 15;
    enemy.target = checkpoints[1];

    return enemy;
}

function play(){
    for(let i in towers){
        let tower = towers[i];
        tower.bullets = tower.bullets.filter( bullet => {
            if(g.distance(tower, bullet) > tower.range){
                g.remove(bullet);
                return false;
            }
            g.move(bullet);
            return true;
        })
    }
    g.multipleCircleCollision(enemies, true);
    enemies = enemies.filter(enemy => {
        if(!enemy) return console.log('enemy null')
        g.contain(enemy, g.stage, true)
        let speed = 2;
        let checkpointReached = g.hit(enemy, enemy.target);
        if(checkpointReached){
            let checkpointIndex = checkpoints.indexOf(enemy.target);
            let nextTarget = checkpoints[checkpointIndex + 1];
            if(!nextTarget){
                g.remove(enemy);
                lives--;
                return false;
            } else {
                enemy.target = nextTarget;
            }
        }
        g.followConstant(enemy, enemy.target, speed);
        let isAlive = true
        towers.forEach(tower => {
            if(g.hit(tower.range, enemy)){

                tower.targets.push(enemy);
            }
            tower.selectTarget();
            tower.bullets = tower.bullets.filter(bullet => {
                if(g.hit(enemy, bullet)){
                    if(enemy.hp > 1) {
                        // console.log('Enemy hit hp', enemy.hp)
                        enemy.healthBar.inner.width -= 10;
                        enemy.hp--;
                    } else {11
                        try{
                            g.remove(enemy)
                        }catch(error){
                            console.log("g remove enemy error")
                        }
                        isAlive = false
                    }                    
                    // g.remove(bullet)
                    // return false
                }

                // if(!g.hit(tower.range, bullet)){
                // if(!g.hit(g.stage, bullet)){
                if(g.distance(tower, bullet) > tower.range.radius * 2){
                    g.remove(bullet)
                    return false
                }
                return true
            })
        })
        if(!isAlive) score += 50;
        return isAlive
    })
}