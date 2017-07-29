class Enemy extends Entity {
    constructor(template){
        super(template);

        this.speed = template.speed;
    }
}

Enemy.prototype.speed = 0;