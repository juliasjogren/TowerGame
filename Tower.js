// class Tower{
//     constructor(x, y, tower, circle){
//         this.x = x;
//         this.y = y;
//         this.type = "tower";
//         this.targets = [];
//         this.circle = circle;
//         this.maxHealth = tower.health;
//         this.health = tower.health;
//         this.damage = tower.damage;
//         this.shoot = tower.shoot;
//         this.shotCooldown = new Utils.Cooldown(tower.fireRate);
//         this.healthBar = new Utils.HealthBar(this);
//         this.range = new Utils.Range(this, tower.range);
//     }

//     selectTarget(){
//         let target = this.targets[0];
//         if(target != null){
//             for(let i in this.targets){
//                 // Find a target
//                 //console.log(i);
//             }
//             this.shoot(target);
//         }
//         this.targets = [];
//     }

//     shoot(enemy){
//         if( this.shotCooldown.isReady()){
//             enemy.health -= this.damage;
//         }    
//     }

//     update() {
//         this.healthBar.update();
//     }
// }