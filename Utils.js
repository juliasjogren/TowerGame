var Utils = {
    Cooldown: function(delay) {
        let lastTime = 0;
        this.isReady = function (){
            let now = new Date().getTime();
            if( lastTime + delay <= now){
                lastTime = now;
                return true;
            }
            return false;
        }
    },
    
    HealthBar: function(target){
        let color = target.type === "tower" ? "green" : "red";
        let w = 40;
        let h = 5;
        let healthBar = g.rectangle(w, h, "black");
        let inner = g.rectangle(w, h, color);
        healthBar.inner = inner;
        healthBar.addChild(inner);
        target.addChild(healthBar);
        target.putTop(healthBar);
    
        healthBar.update = function(){
            let healthPercent = target.health/target.maxHealth;
            target.healthBar.inner.width = target.healthBar.width * healthPercent;
        }

        return healthBar; 
    },
    
    Range: function(target, r){
        let range = g.circle(r, 'black');
        range.alpha = 0.1;
        target.addChild(range);
        target.putCenter(range);
        return range;
    }
}