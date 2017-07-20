class GUI{
    constructor(info){
        this.htmlTowerList = document.getElementById('towerList');
        this.htmlTowerTitle = document.getElementById('towerTitle');
        this.htmlOptionsButtons = document.getElementById('options').children[0].children[0].children;
        this.htmlPause = this.htmlOptionsButtons[0];
        this.htmlRestart = this.htmlOptionsButtons[1];
        this.htmlOptions = this.htmlOptionsButtons[2];
        this.htmlExit = this.htmlOptionsButtons[3];
        this.htmlLives = document.getElementById("lives");
        console.log(this.htmlLives);
        this.htmlGold = document.getElementById("gold");
        this.htmlScore = document.getElementById("score");
        this.htmlStatus = document.getElementById("status");

        this.info = info;
    }

    statusLog(...messages){
        this.htmlStatus.innerHTML = messages.join(' ');
        setTimeout(_ => this.htmlStatus.innerHTML = '', 10000);
    }

    updateInfo(l, g, s) {
        this.htmlLives.innerHTML = l;
        this.htmlGold.innerHTML = g;
        this.htmlScore.innerHTML = s;
    }

    setPauseCallback(cb){
        this.htmlPause.onclick = cb;
    }

    makeTowerRow(name, tower, onTowerChange){
        name = name.split(/(?=[A-Z])/g).join(" ");

        let row = this.htmlTowerList.insertRow();

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
            onTowerChange(tower);
        }
    }
}