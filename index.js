
class Tile {
    constructor() {
        this.value = 0;
        this.revealed = false;
        this.flag = false;
    }

    isOrNearMine() {
        return this.value < 0 || this.value > 7;
    }

    setMine() {
        this.value = -1;
    }

    increment() {
        if (this.value < 0) return;
        this.value++;
    }

    isSolved() {
        return this.value < 0 ? this.flag : this.revealed;
    }

    draw(row, col) {
        const [x, y] = [(width / mapSize) * row, (height / mapSize) * col]
        noStroke()
        if (this.value < 0) {
            fill(0)
            circle((width / mapSize) * (row+0.5), (height / mapSize) * (col+0.5), (width / mapSize) / 2)
        } else if (this.value > 0) {
            fill(tilecolors[this.value])
            text(this.value, (width / mapSize) * (row+0.5), (height / mapSize) * (col+0.5))
        }
        noFill()
        if (!this.revealed) {
            fill("gray")
            stroke(0)
        }
        rect(x, y, (width / mapSize), (height / mapSize))
        if (this.flag && !this.revealed) {
            noStroke()
            fill("red")
            circle((width / mapSize) * (row+0.5), (height / mapSize) * (col+0.5), (width / mapSize) / 3)
        }
    }

    reveal() {
        if (this.flag) return false;
        this.revealed = true;
        if (this.value < 0) {
            lose = true;
            redraw()
            return false;
        } else if (this.value == 0) return true;
    }

    cascade(row, col) {
        for (let r = Math.max(row - 1, 0); r <= Math.min(row + 1, tiles.length-1); r++)
        for (let c = Math.max(col - 1, 0); c <= Math.min(col + 1, tiles[r].length-1); c++)
            if ((r!=row || c!=col) && tiles[r][c].value >= 0 && !tiles[r][c].revealed && tiles[r][c].reveal()) tiles[r][c].cascade(r, c)
    }

    testClick(row, col) {
        const [w, h] = [(width / mapSize), (height / mapSize)]
        const [x, y] = [w * row, h * col]
        if (!(x < mouseX && mouseX < x+w && y < mouseY && mouseY < y+h)) return false;
        
        if (mouseButton == LEFT && this.reveal()) {
            this.cascade(row, col)
        } else if (mouseButton == RIGHT) {
            this.flag = !this.flag;
        }
        return true;
    }
}

const tilecolors = [
    "#000000",
    "#0000ff",
    "#00ff00",
    "#ff0000",
    "#000084",
    "#840000",
    "#008484",
    "#840084",
    "#848484"
]

const difficulty = 0.5;
const mapSize = 16;
let tiles;
let lose = false;

function buildField() {
    tiles = Array.from(new Array(mapSize)).map(_=>Array.from(new Array(mapSize)).map(_=>new Tile()))
    for (let i = 0; i < difficulty*((mapSize ** 2) / 4); i++) {
        const [x, y] = [Math.floor(Math.random() * mapSize), Math.floor(Math.random() * mapSize)]
        if (tiles[x][y].isOrNearMine()) {
            i--; continue;
        }
        for (let r = Math.max(x - 1, 0); r <= Math.min(x + 1, tiles.length-1); r++)
            for (let c = Math.max(y - 1, 0); c <= Math.min(y + 1, tiles[r].length-1); c++)
                if (r==x && c==y) {tiles[r][c].setMine()} else {tiles[r][c].increment()}
    }
}

function setup() {
    createCanvas(640, 640);
    textAlign(CENTER, CENTER)
    noLoop();
    buildField()
}

function draw() {
    if (lose) {
        background(0)
        textSize(50);
        noFill()
        stroke(0xffffffff);
        text("L", width/2, height/2);
        buildField();
        return;
    }
    background(0xbbbbbb)
    textSize(width/mapSize)
    for (let r = 0; r < tiles.length; r++)
        for (let c = 0; c < tiles[r].length; c++)
            tiles[r][c].draw(r, c);
    
    if (tiles.flat().every(t=>t.isSolved())) {
        background(0)
        textSize(50);
        noFill()
        stroke(0xffffffff);
        text("W", width/2, height/2);
        buildField();
    }
}

function mouseReleased() {
    if (lose) {
        lose = false;
        redraw();
        return;
    }
    for (let r = 0; r < tiles.length; r++)
        for (let c = 0; c < tiles[r].length; c++)
            if (tiles[r][c].testClick(r, c)) break;
    redraw();
    return false;
}
