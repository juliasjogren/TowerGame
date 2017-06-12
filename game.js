let score = 0;
let lives = 50;

let spawner = [];
let enemies = [];
let checkpoints = [];
let activeTowers = [];

let towers = {
    BombTower: {
        fireRate: 1500, health: 1000, range: 250, size: 40, damage: 500, color: "LawnGreen",
        shoot: function(angle){
            g.shoot(this, 
                    angle,
                    this.halfWidth,
                    this.halfHeight,
                    g.stage,
                    7,
                    this.bullets,
                    () => g.circle(40, 'green')
            );
        },
        description: 'Bomb tower, blow your enemies brains out'
    },
    FireWall: {
        fireRate: 250, health: 1500, range: 150, size: 20, damage: 50, color: "OrangeRed",
        shoot: function(angle){
            g.shoot(this, 
                    angle,
                    this.halfWidth,
                    this.halfHeight,
                    g.stage,
                    2,
                    this.bullets,
                    () => g.circle(10, 'red')
            );
            g.shoot(this, 
                    angle + 0.25,
                    this.halfWidth,
                    this.halfHeight,
                    g.stage,
                    2,
                    this.bullets,
                    () => g.circle(10, 'red')
            );
            g.shoot(this, 
                    angle - 0.25,
                    this.halfWidth,
                    this.halfHeight,
                    g.stage,
                    2,
                    this.bullets,
                    () => g.circle(10, 'red')
            );
        },
        description: 'burn your enemies to their death'
    }
};

let selectedTower = towers.BombTower;

let htmlTowerList = document.getElementById('towerList');
let htmlTowerTitle = document.getElementById('towerTitle');

htmlTowerTitle.onclick = function(){
    let towerTable = htmlTowerList.children[0].children;
    for(let i = 0; i < towerTable.length; i++){
        let descriptionCell = towerTable.item(i).children[1];
        descriptionCell.classList.toggle('hidden');
       console.log(descriptionCell)
    }
}

for(key in towers){
    makeTowerRow(key, towers[key]);
}

function makeTowerRow(name, tower){

    name = name.split(/(?=[A-Z])/).join(" ");

    let row = htmlTowerList.insertRow();

    let cell1 = row.insertCell(0);
    let title = document.createElement('h3');
    title.appendChild(document.createTextNode(name));
    cell1.appendChild(title);
    let image = document.createElement('img');
    image.width = 50;
    image.height = 50;
    cell1.appendChild(image);

    let cell2 = row.insertCell(1);
    let description = document.createElement('p');
    description.appendChild(document.createTextNode(tower.description));
    cell2.appendChild(description);
    cell2.classList.toggle('hidden');

    row.tower = tower;

    row.onclick = function(){
        selectedTower = tower;
    }
}

let gameWidth = document.documentElement.clientWidth;
let gameHeight = document.documentElement.clientHeight;

let g = hexi(gameWidth, gameHeight, setup);

g.scaleToWindow();
g.backgroundColor = '#004d00';

function setup(){
    console.log('Starting setup');
    let spawnInterval = 700;
    
    let spawnEnemies = function(){

        spawner.push(Enemy);
        spawner.push(Enemy);

        g.wait(spawnInterval, spawnEnemies);

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

    let tower = new Tower(x, y);
    activeTowers.push(tower);
}


g.start();

function Cooldown(delay){
    let lastTime = 0;
    this.isReady = function (){
        let now = new Date().getTime();
        if( lastTime + delay <= now){
            lastTime = now;
            return true;
        }
        return false;
    }
}




function Tower(x, y){

    
    let tower = g.circle(selectedTower.size, selectedTower.color, 'black', 2, x-selectedTower.size/2, y-selectedTower.size/2);
    tower.range = createRange(selectedTower.range); 
    tower.putCenter(tower.range);
    tower.bullets = [];
    tower.targets = [];
  
    g.wait(2500, () => { tower.range.visible = false})

    tower.shotCooldown = new Cooldown(selectedTower.fireRate);
    tower.maxHealth = selectedTower.health;
    tower.health = selectedTower.health;
    tower.type = "tower";
    tower.damage = selectedTower.damage;
    tower.newShoot = selectedTower.shoot;

    addHealthBar(tower, 40, 5, "green");


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
     
        if( tower.shotCooldown.isReady()){
            let angle = g.angle(this, enemy);
            let speed = 10;

            tower.newShoot(angle);
        }    
    }

    tower.play = function() {

        tower.healthBar.update();

        tower.bullets = tower.bullets.filter( bullet => {
            if(g.distance(tower, bullet) > tower.range){
                g.remove(bullet);
                return false;
            }
            g.move(bullet);
            return true;
        })
    }

    
    return tower;
}

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

function HealthBar(w, h, color) {

    let healthBar = g.rectangle(w, h, "black");
    
    let inner = g.rectangle(w, h, color);
    healthBar.inner = inner;
    healthBar.addChild(inner);

    return healthBar;
}

function addHealthBar(obj, w, h, color){
    let healthBar = new HealthBar(w, h, color);

    obj.healthBar = healthBar;
    obj.addChild(healthBar);
    obj.putTop(healthBar);

    
    healthBar.update = function(){
        let healthPercent = obj.health/obj.maxHealth;
        obj.healthBar.inner.width = obj.healthBar.width * healthPercent;
    } 
}

function Enemy(x, y){
    
    x = checkpoints[0].x;
    y = checkpoints[0].y;

    let enemy = g.circle(15, "pink", "purple", 5, x, y);

    addHealthBar(enemy, 40, 5, "red");

    enemy.speed = 2;
    enemy.health = 800;
    enemy.maxHealth = 800;
    enemy.target = checkpoints[1];
    enemy.currentCheckpoint = 1;
    enemy.type = 'enemy';
    enemy.range = g.circle(30, "")
    enemy.cooldown = new Cooldown(500);
    enemy.damage = 10;

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
                    lives--;
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

function play(){

    SpawnEnemy();

    activeTowers = activeTowers.filter(tower => {
        if(tower.health <= 0){
            tower.bullets = tower.bullets.filter(b => {
                g.remove(b);
                return false;
            });
            activeTowers.slice(activeTowers.indexOf(tower));
            g.remove(tower);
        } 
        return tower.health > 0;
    });

    activeTowers.map(tower => tower.play());

    checkEnemyCollision();

    enemies = enemies.filter(enemy => {
        if(!enemy) return console.log('enemy null')
        
        let isAlive = enemy.play();
       
        activeTowers.forEach(tower => {
            if(g.hit(tower.range, enemy)){

                tower.targets.push(enemy);
            }
            tower.selectTarget();
            tower.bullets = tower.bullets.filter(bullet => {
                if(g.hit(enemy, bullet)){
                    enemy.health -= tower.damage;

                    if(enemy.health > 0) {
                        enemy.healthBar.update();
                    } else {
                        isAlive = false
                    }
                    g.remove(bullet);

                    return false;
                }

                // if(!g.hit(tower.range, bullet)){
                // if(!g.hit(g.stage, bullet)){
                if(g.distance(tower, bullet) > tower.range.radius){
                    g.remove(bullet)
                    return false
                }
                return true
            })
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
}

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
function createRange(range){
    let r = g.circle(range, 'black');
    r.alpha = 0.1;

    return r;
    
}

function SpawnEnemy(){

    if(spawner.length > 0){

        let x = spawner.shift();

        let enemy = new x();

        enemies.push(enemy);

    }
}