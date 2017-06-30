let gui = new GUI();

// Globals
let score = 0;
let lives = 10;
let gold = 1000;

let spawner = [];
let enemies = [];
let checkpoints = [];
let activeTowers = [];

// DB
let towers = {
    BombTower: {
        fireRate: 1500, health: 700, range: 250, size: 40, damage: 500, color: "LawnGreen", price: 350,
        description: 'Blow your enemies brains out'
    },
    FireWall: {
        fireRate: 250, health: 1000, range: 150, size: 20, damage: 50, color: "OrangeRed", price: 300,
        description: 'Burn your enemies to their death'
    },
    ArrowTower: {
        fireRate: 50, health: 50, range: 50, size: 10, damage: 50, color: "blue", price: 50,
        description: 'uuuuu'
    }
};

let selectedTower;

let htmlStatus = document.getElementById("status");

function statusLog(...messages){
    htmlStatus.innerHTML = messages.join(' ');
    setTimeout(htmlStatus.innerHTML = '', 5000);
}

statusLog('Starting!')

let gameWidth = document.documentElement.clientWidth;
let gameHeight = document.documentElement.clientHeight;

let g = hexi(gameWidth, gameHeight, setup);

function setup(){
    console.log('Starting setup');
    g.scaleToWindow();
    g.backgroundColor = '#004d00';

    let spawnInterval = 700;
    let spawnEnemies = function(){
        if(spawner.length < 10){
            spawner.push(Enemy);
            spawner.push(Enemy);
        }
        g.wait(spawnInterval, spawnEnemies);
    }
    
    gui.setPauseCallback(pause);

    for(key in towers){
        console.log(key)
        gui.makeTowerRow(key, towers[key]);
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

    buildTower(x, y);
}

function buildTower(x, y){
    if(!selectedTower) return statusLog('No tower selected.');
    if(gold < selectedTower.price) return statusLog('Not enough gold.');

    let tower = new Tower(x, y, selectedTower);
    //let circle = g.circle(selectedTower.size, selectedTower.color, 'black', 2, x-selectedTower.size/2, y-selectedTower.size/2);
    //let tower = new Tower(x, y, selectedTower, circle);

    if(hitStartOrTower(tower)){
        statusLog('Bad placement.')
        g.remove(tower);
    } else {
        activeTowers.push(tower);
        gold -= selectedTower.price;
    }    
}

function hitStartOrTower(tower){
    if(g.hit(tower, checkpoints[0], true)) return true;

    for(let t of activeTowers)
        if(g.hit(tower, t, true)) return true;

    return false;
}

g.start();

function Checkpoint(x, y){
    let checkpoint = g.circle(0, 'black', 'black', 0, x, y);
    checkpoint.setPivot(0.5, 0.5);
    checkpoint.type = 'checkpoint';

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

    enemy.speed = 2;
    enemy.health = 800;
    enemy.maxHealth = 800;
    enemy.target = checkpoints[1];
    enemy.currentCheckpoint = 1;
    enemy.type = 'enemy';
    enemy.range = g.circle(30, "")
    enemy.damage = 10;

    enemy.healthBar = new Utils.HealthBar(enemy);
    enemy.cooldown = new Utils.Cooldown(500);

    enemy.hitTower = function(tower) {
        if(enemy.cooldown.isReady())
            tower.health -= enemy.damage;

        if(tower.health <= 0){
            enemy.target = checkpoints[enemy.currentCheckpoint];
        }
    }

    enemy.play = function() {

        activeTowers.forEach(tower => {
            if(g.hit(enemy, tower) && enemy.target != tower){
                    enemy.target = tower;
            }
        })

        let isAlive = true;

        let targetReached = g.hit(enemy, enemy.target);
        if(targetReached){
           
            if(enemy.target.type === "checkpoint"){
                let nextTarget = checkpoints[enemy.currentCheckpoint + 1];
                if(!nextTarget){
                    isAlive = false;
                    loseLife();
                } else {
                    enemy.currentCheckpoint++;
                    enemy.target = nextTarget;
                }
            } else {
                enemy.hitTower(enemy.target);
            }
        } else {
            g.followConstant(enemy, enemy.target, enemy.speed);
        }
        return isAlive;    
    }
    return enemy;
}

function Tower(x, y, t){
    let tower = g.circle(t.size, t.color, "black", 2, x-t.size/2, y-t.size/2);

    tower.targets = [];
    tower.maxHealth = t.health;
    tower.health = t.health;
    tower.damage = t.damage;
    tower.shoot = t.shoot;
    tower.type = "tower";
    tower.shotCooldown = new Utils.Cooldown(t.fireRate);
    tower.healthBar = new Utils.HealthBar(tower);
    tower.range = addRange(tower, t.range);

    console.log(tower.range)

    tower.selectTarget = function() {
        let target = this.targets[0];
        if(target != null){
            for(let i in this.targets){
                // Find a target
                //console.log(i);
            }
            this.shoot(target);
        }
        this.targets = [];
    }

    tower.shoot = function(enemy) {
        if( this.shotCooldown.isReady()){
            enemy.health -= this.damage;
        }    
    }


    tower.update = function() {
        this.healthBar.update();
    }

    return tower;
}

function addRange(target, r){
    let range = g.circle(r, 'black');
    range.alpha = 0.1;
    target.addChild(range);
    target.putCenter(range);
    return range;
}

function loseLife(){
    lives--;
    if(lives < 0){
        g.pause();
        alert("Game Over!");
        window.location.reload();
    }
}

function play(){

    SpawnEnemy();

    activeTowers = activeTowers.filter(tower => {
        if(tower.health <= 0){
            activeTowers.slice(activeTowers.indexOf(tower));
            g.remove(tower);
        } 
        return tower.health > 0;
    });

    activeTowers.map(tower => tower.update());

    checkEnemyCollision();

    enemies = enemies.filter(enemy => {
        if(!enemy) return console.log('enemy null')
        
        let isAlive = enemy.play();
       
        if(enemy.health > 0) {
            enemy.healthBar.update();
        } else {
            isAlive = false
            gold += 50;
        }

        activeTowers.forEach(tower => {
            if(g.distance(tower, enemy) <= tower.range.radius){
                tower.targets.push(enemy);
                tower.selectTarget();
            }
        })
        if(!isAlive){
            try{
                g.remove(enemy)
            }catch(error){
                console.log("g remove enemy error")
            }
            score += 50;
        } 
        return isAlive
    })

    gui.updateInfo(lives, gold, score);
} // /Play

function checkEnemyCollision(){
    for(let i = 0; i < enemies.length; i++) {
        let e1 = enemies[i];
        for(let j = i+1; j < enemies.length; j++) {
            let e2 = enemies[j];
            if(g.hit(e1, e2)){
                g.circleCollision(e2, e1);
            }
        }
    }
}

function SpawnEnemy(){
    if(spawner.length > 0){
        let enemy = spawner.shift();
        enemies.push(new enemy);
    }
}

function pause(){
    if(g.paused)
        g.resume();
    else 
        g.pause();
}