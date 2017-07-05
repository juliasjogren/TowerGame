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
    setTimeout(_ => htmlStatus.innerHTML = '', 5000);
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
        gui.makeTowerRow(key, towers[key]);
    }

    checkpoints.push(new Checkpoint(gameWidth * 0.2, gameHeight * 0.2));   
    checkpoints.push(new Checkpoint(gameWidth * 0.8, gameHeight * 0.2));   
    checkpoints.push(new Checkpoint(gameWidth * 0.2, gameHeight * 0.8));   
    checkpoints.push(new Checkpoint(gameWidth * 0.2, gameHeight * 0.2));   

    drawLineBetweenCheckpoints(checkpoints);

    spawnEnemies();    

    g.state = play;
}

g.pointer.tap = () => {

    let {x, y} = g.pointer;

    buildTower(x, y, selectedTower);
}

function buildTower(x, y, t){
    if(!t) return statusLog('No tower selected.');
    if(gold < t.price) return statusLog('Not enough gold.');

    let tower = new Tower(x, y, t);
    tower.circle = g.circle(t.size, t.color, 'black', 0, x-t.size/2, y-t.size/2);
    tower.healthBar = new Utils.HealthBar(tower);

    if(hitStartOrTower(tower.circle)){
        statusLog('Bad placement.')
        g.remove(tower.circle);
    } else {
        activeTowers.push(tower);
        gold -= t.price;
    }    
}

function hitStartOrTower(tower){
    if(g.hit(tower, checkpoints[0].circle, true)) return true;

    for(let t of activeTowers)
        if(g.hit(tower, t.circle, true)) return true;

    return false;
}

g.start();

function Checkpoint(x, y){
    let checkpoint = {x:x, y:y};
    checkpoint.circle = g.circle(0, 'black', 'black', 0, x, y);
    checkpoint.circle.setPivot(0.5, 0.5);
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

    let enemy = {};

    enemy.circle=  g.circle(15, "pink", "purple", 5, x, y);
    enemy.speed = 2;
    enemy.health = 800;
    enemy.maxHealth = 800;
    enemy.target = checkpoints[1];
    enemy.currentCheckpoint = 1;
    enemy.type = 'enemy';
    enemy.range = 50;
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

        if(enemy.target.type != 'tower'){
            activeTowers.forEach(tower => {
                if(tower.enemies.length < 5 && isWithinRange(enemy, tower)){
                    tower.enemies.push(enemy);
                    enemy.target = tower;
                }
            })
        }
        
        let isAlive = true;

        let targetReached = isWithinRange(enemy, enemy.target)

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
            g.followConstant(enemy.circle, enemy.target.circle, enemy.speed);
        }
        return isAlive;    
    }
    return enemy;
}

function TowerZ(x, y, t){
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

    tower.selectTarget = function() {
        let target = this.targets[0];
        if(!!target){
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
        //this.healthBar.update();
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
            g.remove(tower.circle);
        } 
        return tower.health > 0;
    });

    checkEnemyCollision();

    enemies = enemies.filter(enemy => {
        if(!enemy) return console.log('enemy null')
        
        let isAlive = enemy.play();
       
        if(enemy.health <= 0) {
            isAlive = false
        }

        activeTowers.forEach(tower => {
            if(isWithinRange(tower, enemy)){
                tower.targets.push(enemy);
                tower.selectTarget();
                if(g.hit(tower.circle, enemy.circle)){
                    g.circleCollision(enemy.circle, tower.circle);
                }
            }
        })
        if(!isAlive){
            try{
                g.remove(enemy.circle)
            }catch(error){
                console.log("g remove enemy error")
            }
            gold += 50;
            score += 50;
        } 
        return isAlive
    })

    gui.updateInfo(lives, gold, score);
} // /Play

function checkEnemyCollision(){
    for(let i = 0; i < enemies.length; i++) {
        let e1 = enemies[i].circle;
        for(let j = i+1; j < enemies.length; j++) {
            let e2 = enemies[j].circle;
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

function isWithinRange(o1, o2){
    return o1.range > g.distance(o1.circle, o2.circle);
}