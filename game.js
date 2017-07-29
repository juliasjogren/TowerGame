// Globals
let score = 0;
let lives = 10;
let gold = 1500;

let spawner = [];
let enemies = [];
let checkpoints = [];
let activeTowers = [];
let selectedTower;

let gui = new GUI();

let gameWidth = document.documentElement.clientWidth;
let gameHeight = document.documentElement.clientHeight;

let g = hexi(gameWidth, gameHeight, setup);

function setup(){
    console.log('Starting setup');
    g.scaleToWindow();
    g.backgroundColor = '#004d00';
    g.FPS = 30;

    let spawnIntervalMillis = 2500;
    let spawnEnemies = function(){

        spawner.push(makeEnemy);
        spawner.push(makeEnemy);

        if(spawnIntervalMillis < 750)
            spawnIntervalMillis = 750;
        else
            spawnIntervalMillis -= 50;

        g.wait(spawnIntervalMillis, spawnEnemies);
    }
    
    gui.setPauseCallback(pause);

    for(let key in GAMEDATA.towers){
        gui.makeTowerRow(key, GAMEDATA.towers[key], onTowerChange);
    }
    
    for(let key in GAMEDATA.atlas.Elves.t2){
        let c = GAMEDATA.atlas.Elves.t2[key];
        checkpoints.push(new Checkpoint(gameWidth * c.x, gameHeight * c.y));   
    }

    drawLineBetweenCheckpoints(checkpoints);

    spawnEnemies();    

    g.state = play;
}

function onTowerChange(tower){

    selectedTower = tower;

    if(!!selectedTower.circle)
        g.remove(selectedTower.circle);

    selectedTower.circle = g.circle(tower.size, tower.color, 'black', 1, 0, 0);
    let range = g.circle(tower.range + selectedTower.circle.radius, 'black', 'black', 1);
    range.alpha = 0.1;
    selectedTower.circle.addChild(range);
    selectedTower.circle.putCenter(range);

    setInterval(()=>{selectedTower.circle.x = g.pointer.x-selectedTower.circle.radius/2;selectedTower.circle.y = g.pointer.y-selectedTower.circle.radius/2}, 50)
}

g.pointer.tap = () => {

    let {x, y} = g.pointer;

    makeTower(x, y, selectedTower);
}

function hitStartOrTower(tower){
    if(g.hit(tower, checkpoints[0].circle, true)) return true;

    for(let t of activeTowers)
        if(g.hit(tower, t.circle, true)) return true;

    return false;
}

g.start();

function Checkpoint(x, y){
    this.x = x;
    this.y = y;
    this.circle = g.circle(0, 'black', 'black', 0, x, y);
    this.circle.setPivot(0.5, 0.5);
}

function drawLineBetweenCheckpoints(checkpoints){
    let prevCheckpoint = null;

    checkpoints.forEach( (checkpoint, i) => {
        
        let checkpointMarker = g.circle(100, '#CC9966', 'black', 0, checkpoint.x - 50, checkpoint.y - 50);

        if(prevCheckpoint != null){
            checkpointMarker.color = 'white';
            g.line('#CC9966', 100, checkpoint.x, checkpoint.y, prevCheckpoint.x, prevCheckpoint.y);
        }
        prevCheckpoint = checkpoint;
    });
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
        tower.play();
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
            gold += 50;
            score += 50;
        }

        activeTowers.forEach(tower => {
            if(isWithinRange(tower, enemy, tower.range)){
                tower.targets.push(enemy);
                tower.selectTarget();
                if(g.hit(tower.circle, enemy.circle)){
                    g.circleCollision(enemy.circle, tower.circle);
                }
            }
        })
        if(!isAlive){
            try{
                g.remove(enemy.circle);
            }catch(error){
                console.log("g remove enemy error")
            } finally {
                enemy.circle = undefined;
            }
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
//        enemies.push(Object.create(Enemy, enemy));
    }
}

function pause(){
    if(g.paused){
        g.resume();
        gui.statusLog('Unpaused');
    }
    else {
        g.pause();
        gui.statusLog('Paused');
    }
}

function isWithinRange(o1, o2, dist){
    return dist > g.distance(o1.circle, o2.circle);
}

function makeTower(x, y, towerTemplate){
    if(!towerTemplate) return gui.statusLog('No tower selected.');
    if(gold < towerTemplate.gold) return gui.statusLog('Not enough gold.');

    let tower = new Tower(towerTemplate);
    tower.circle = g.circle(towerTemplate.size, towerTemplate.color, 'black', 1, x-towerTemplate.size/2, y-towerTemplate.size/2);
    tower.healthBar = new Utils.HealthBar(tower);

    if(hitStartOrTower(tower.circle)){
        gui.statusLog('Bad placement.')
        g.remove(tower.circle);
    } else {
        activeTowers.push(tower);
        gold -= towerTemplate.gold;
        //g.remove(selectedTower.circle);
        //selectedTower = undefined;
    }    
}

function getRandomEnemyTemplate() {
    let enemyNames = Object.keys(GAMEDATA.enemies)
    let enemyCount = enemyNames.length;
    // let randomEnemyNumber = Math.floor(Math.random() * enemyCount); // This should be quite random
    let randomNumber = Math.random();
    let randomEnemyNumber = randomNumber >= 0.95 ? 3
                            : randomNumber >= 0.9 ? 2
                            : randomNumber >= 0.8 ? 1
                            : 0;
    let randomEnemy = enemyNames[randomEnemyNumber];
    return GAMEDATA.enemies[randomEnemy];
}

function makeEnemy(){
    
    let x = checkpoints[0].x;
    let y = checkpoints[0].y;

    let randomEnemy = getRandomEnemyTemplate();

    let enemy = new Enemy(randomEnemy);

    enemy.circle = g.circle(enemy.size, enemy.color, "black", 1, x-enemy.size/2, y-enemy.size/2);
    enemy.target = checkpoints[1];
    enemy.currentCheckpoint = 1;
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

        if(enemy.target instanceof Checkpoint){
            activeTowers.forEach(tower => {
                if(tower.enemies.length <= 5 && isWithinRange(enemy, tower, enemy.range)){
                    tower.enemies.push(enemy);
                    enemy.target = tower;
                    return;
                }
            })

            if(isWithinRange(enemy, enemy.target, 25)){
                let nextTarget = checkpoints[enemy.currentCheckpoint + 1];
                if(!nextTarget){
                    loseLife();
                    return false;
                } else {
                    enemy.currentCheckpoint++;
                    enemy.target = nextTarget;
                }
            }
        } else {

            if(isWithinRange(enemy, enemy.target, enemy.range)){
                enemy.hitTower(enemy.target);
            } else {
                g.followConstant(enemy.circle, enemy.target.circle, enemy.speed);
            }
        }
                    g.followConstant(enemy.circle, enemy.target.circle, enemy.speed);

        return true;    
    }
    return enemy;
}