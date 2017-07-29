class Tower extends Entity {
    constructor(template){
        super(template);

        this.shotCooldown = new Utils.Cooldown(this.fireRate);
    }
}

Tower.prototype.enemies = [];
Tower.prototype.targets = [];


Tower.prototype.play = function(){
    this.cleanEnemyList();
}

Tower.prototype.cleanEnemyList = function(){
    let newEnemies = []
    for(let i = 0; i < this.enemies.length; i++){
        let enemy = this.enemies[i];

        if(!enemy.circle){
//            console.log('Removing dead enemy!')
        } else {
            newEnemies.push(enemy);
        }
    }
    this.enemies = newEnemies;
}

Tower.prototype.selectTarget = function(){
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

Tower.prototype.shoot = function(enemy){
    if(this.shotCooldown.isReady()){
        enemy.health -= this.damage;
    }    
}