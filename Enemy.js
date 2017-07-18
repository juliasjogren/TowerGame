class Enemy{
    constructor(x, y, e){
        this.x = x;
        this.y = y;

        for(let key of Object.keys(e))
            this[key] = e[key];
    }
}