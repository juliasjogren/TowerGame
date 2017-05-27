let enemies = [];
let checkpoints = [];
let towers = [];

let g = hexi(900, 600, setup);

// g.scaleToWindow();
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

    checkpoints.push(new Checkpoint(0,50));
    checkpoints.push(new Checkpoint(550,50));
    checkpoints.push(new Checkpoint(100,350));
    checkpoints.push(new Checkpoint(700,250));
    checkpoints.push(new Checkpoint(550,550));

    drawLineBetweenCheckpoints(checkpoints);

    spawnEnemies();    

    g.state = play;
}

g.pointer.tap = () => {
    
    let x = g.pointer.x;
    let y = g.pointer.y;

    console.log('click at (', x, y, ')');

    let tower = new Tower(x, y);
    towers.push(tower);
}


g.start();


function Tower(x, y){

    let tower = g.circle(25, 'blue', 'black', 2, x-25/2, y-25/2);
    tower.range = g.circle(250, 'black', 'red', 5);
    tower.putCenter(tower.range);
    tower.range.alpha = 0.1;
    tower.bullets = [];
    tower.targets = [];
    tower.cooldown = 500;
    tower.lastShotTime = 0;

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
        if( tower.lastShotTime + tower.cooldown <= now.getTime()){
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
        
        let checkpointMarker = g.circle(52, '#CC9966', 'black', 0, checkpoint.x - 26, checkpoint.y - 26);

        if(prevCheckpoint != null){
            g.line('#CC9966', 50, checkpoint.x, checkpoint.y, prevCheckpoint.x, prevCheckpoint.y);
        }
        prevCheckpoint = checkpoint;
    });
}

function Enemy(x, y){
    
    x = checkpoints[0].x;
    y = checkpoints[0].y;

    let enemy = g.circle(15, "pink", "purple", 5, x, y);

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
                console.log('Life lost?')
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
        return isAlive
    })
}