class Tower{
    constructor(x, y, tower){
        this.x = x;
        this.y = y;
        this.type = "tower";
        this.targets = [];
        this.enemies = [];
        this.maxHealth = tower.health;
        this.shotCooldown = new Utils.Cooldown(tower.fireRate);

        for(let key of Object.keys(tower))
           this[key] = tower[key]
    }

    selectTarget(){
        let target = this.targets[0];
        if(!!target){
            for(let i in this.targets){
                // Find a target
                //console.log(i);
            }
            this.shoot(target);
        }
        this.targets = [];
        this.enemies = [];
    }

    shoot(enemy){
        if(this.shotCooldown.isReady()){
            enemy.health -= this.damage;
        }    
    }
}