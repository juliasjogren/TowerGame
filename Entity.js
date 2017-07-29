class Entity {
    constructor(template){
        this.health         = template.health;
        this.maxHealth      = template.maxHealth;
        this.damage         = template.damage;
        this.fireRate       = template.fireRate;
        this.range          = template.range;
        this.gold           = template.gold;
        this.description    = template.description;
        this.size           = template.size;
        this.color          = template.color;
    }
}

Entity.prototype.health         = 0;
Entity.prototype.maxHealth      = 0;
Entity.prototype.damage         = 0;
Entity.prototype.fireRate       = 0;
Entity.prototype.range          = 0;
Entity.prototype.gold           = 0;
Entity.prototype.description    = '';
Entity.prototype.size           = 0;
Entity.prototype.color          = '';