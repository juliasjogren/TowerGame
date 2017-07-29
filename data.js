const GAMEDATA = {
    towers: {
        BombTower: {
            health: 700,
            maxHealth: 700,
            damage: 350,
            fireRate: 1500,
            range: 250,
            gold: 300,
            description: 'Blow your enemies brains out',
            size: 40,
            color: "LawnGreen",
        },
        FireWall: {
            health: 1000,
            maxHealth: 1000,
            damage: 50,
            fireRate: 250,
            range: 150,
            color: "OrangeRed",
            gold: 200,
            description: 'Burn your enemies to a crisp.',
            size: 20,
        },
        BlueberryTower: {
            health: 50,
            maxHealth: 50,
            damage: 50,
            fireRate: 50,
            range: 50,
            gold: 50,
            description: 'Small but deadly!',
            size: 10,
            color: "blue",
         }
    },

    enemies: {
        Small: {
            health: 400,
            maxHealth: 400,
            damage: 10,
            fireRate: 250,
            range: 100,
            speed:3,
            gold: 50,
            description: 'Tiny, fast and easy to kill',
            size: 15,
            color: "black",
        },
        Medium: {
            health: 750,
            maxHealth: 750,
            damage: 20,
            fireRate: 450,
            range: 200,
            speed:2,
            gold: 250,
            description: 'Medium',
            size: 40,
            color: "purple",
        },
        Large: {
            health: 1400,
            maxHealth: 1400,
            damage: 40,
            fireRate: 450,
            range: 200,
            speed:1,
            gold: 600,
            description: 'Large',
            size: 75,
            color: "DarkRed",
        },
        Boss: {
            health: 3000,
            maxHealth: 3000,
            damage: 9999,
            fireRate: 5000,
            range: 150,
            speed:0.5,
            gold: 3000,
            description: 'Run for your life!',
            size: 150,
            color: "gold",
        }
    },

    waves: {
        Easy: {
            Small: 10,
            Small: 10,
            Small: 10,
            Medium: 5,
        },
        Medium: {
            Small: 10,
            Medium: 5,
            Large: 5,
            Large: 5,
            Medium: 5,
            Small: 10,
        },
        Hard: {
            Small: 15,
            Medium: 10,
            Large: 5,
        },
        Boss: {
            Small: 10,
            Medium: 5,
            Large: 5,
            Boss: 1,
        },
    },

    atlas: {
        Elves: {
            t1:[
                {x:0.2, y:0.2},
                {x:0.6, y:0.2},
                {x:0.8, y:0.5},
                {x:0.6, y:0.8},
                {x:0.2, y:0.8},
            ],
            t2:[
                {x:0.2, y:0.8},
                {x:0.6, y:0.2},
                {x:0.8, y:0.5},
                {x:0.6, y:0.8},
                {x:0.2, y:0.2},
            ]
        },
        Dwarves: {
            t1:[
                {x:0.2, y:0.8},
                {x:0.6, y:0.2},
                {x:0.8, y:0.5},
                {x:0.6, y:0.8},
                {x:0.2, y:0.2},
            ],
            t2:[
                {x:0.2, y:0.8},
                {x:0.6, y:0.2},
                {x:0.8, y:0.5},
                {x:0.6, y:0.8},
                {x:0.2, y:0.2},
            ]
        }
    },

}