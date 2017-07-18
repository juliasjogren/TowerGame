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
        let color = target instanceof Tower ? "green" : "red";
        let w = 40;
        let h = 5;
        let healthBar = g.rectangle(w, h, "black", "black", 1);
        healthBar.visible = false;
        healthBar.alpha = 0.5;
        let inner = g.rectangle(w, h, color, "black", 1);
        inner.visible = false;
        healthBar.inner = inner;
        healthBar.addChild(inner);
        target.circle.addChild(healthBar);
        target.circle.putTop(healthBar, 0, -3);
    
        healthBar.update = function(){
            let healthPercent = target.health/target.maxHealth;
            target.healthBar.inner.width = target.healthBar.width * healthPercent;

            if(healthPercent === 1)
                healthBar.hide();
            else
                healthBar.show();

        }

        healthBar.hide = function(){
            healthBar.visible = false;
            healthBar.inner.visible = false;
        }
        healthBar.show = function(){
            healthBar.visible = true;
            healthBar.inner.visible = true;
        }

        setInterval(healthBar.update, 100);


        return healthBar; 
    },
    
    Range: function(target){
        let range = g.circle(target.range, 'black');
        range.alpha = 0.1;
        target.putCenter(range);
        return range;
    }
}