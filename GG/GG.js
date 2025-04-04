var wordDict = {}
var streak = 0
var topic = ""
var answer = ""
var game = ''
var svg = ` <svg height="200" width="300" xmlns="http://www.w3.org/2000/svg">
  <line x1="0" y1="0" x2="300" y2="200" style="stroke:red;stroke-width:2" />
</svg> `

class gameCanvas {

    constructor(id) {
        this.id = id
        this.cnv = document.getElementById(id);
        this.cnv.width = this.cnv.clientWidth;
        this.cnv.height = this.cnv.clientHeight;
        this.ctx = this.cnv.getContext('2d');
        this.bCount = 0
        this.balls = []
        this.lastTime = null
        this.gameOver = false
        this.yMod = this.cnv.height / 300
        this.xMod = this.cnv.clientWidth / 300
        this.bSize = 50 * (this.yMod + this.xMod) / 2//50        
        this.sMod = 2
        this.gravity = 9.81 / 60 / this.sMod
        
        // Click Handler
        this.isSwiping = false;
        this.cnv.addEventListener("mousedown", (event) => this.startSwipe(event));
        this.cnv.addEventListener("mousemove", (event) => this.trackSwipe(event));
        this.cnv.addEventListener("mouseup", () => this.endSwipe());
        this.cnv.addEventListener("touchstart", (event) => this.startSwipe(event.touches[0]));
        this.cnv.addEventListener("touchmove", (event) => this.trackSwipe(event.touches[0]));
        this.cnv.addEventListener("touchend", () => this.endSwipe());
    }

    startSwipe(event) {
        this.isSwiping = true;
        this.checkBallHit(event.clientX, event.clientY);
    }

    trackSwipe(event) {
        if (!this.isSwiping) return;
        this.checkBallHit(event.clientX, event.clientY);
    }

    endSwipe() {
        this.isSwiping = false;
    }

    checkBallHit(x, y) {
        let rect = this.cnv.getBoundingClientRect();
        let swipeX = x - rect.left;
        let swipeY = y - rect.top;

        for (let i = this.balls.length - 1; i >= 0; i--) {
            let ball = this.balls[i];
            let { x, y } = ball[1];

            let radius = this.bSize / 2;
            let centerX = x + radius;
            let centerY = y + radius;

            let dist = Math.sqrt((swipeX - centerX) ** 2 + (swipeY - centerY) ** 2);
            if (dist <= radius) {
                this.onBallHit(i);
            }
        }
    }

    async onBallHit(index) {
        let hit = this.balls.splice(index, 1)[0]; // Remove ball from array
        if (hit[2] == "abcdefg") {this.balls.push(hit);return}
        this.newBall(hit[1], hit[2], true)
        this.bCount -= 1
        if (hit[2] == answer) {
            roundWon()
        } else {
            roundLost()
        }
    }   

    updateBalls = () => {
        
        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        let hitBottom = 0

        //Gets Deltatime
        if (!this.lastTime) {this.lastTime = Date.now();}
        let deltaTime = (Date.now() - this.lastTime) / 1000
        this.lastTime = Date.now();

        //Draws each ball
        for (let ball of this.balls) {

            // Assuming a = 0 and 60 fps
            if (!(ball[2] == "abcdefg")) {
                ball[1].x += ball[1].vX * this.xMod * deltaTime * 60 / this.sMod;
                ball[1].vY += this.gravity //Need to deltatimeify
                ball[1].y += ball[1].vY * this.yMod * deltaTime * 60 / this.sMod;
                this.ctx.fillStyle = "green";
                this.ctx.font = `${12 * ((this.xMod + this.yMod) / 2)}px OpenDyslexic`;
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(ball[2], ball[1].x + this.bSize / 2, ball[1].y + this.bSize / 2)            
            }
            
            
            this.ctx.drawImage(ball[0], ball[1].x, ball[1].y, this.bSize, this.bSize);
            if (ball[1].y > this.cnv.height + this.bSize*1.25) {
                hitBottom += 1
            }

        }
        if (hitBottom == this.bCount) {
            roundLost();
        } else {
            requestAnimationFrame(this.updateBalls)
        }
    }

    throwRand(bNum, bDir=3) {
        let valList = []
        for (let i=0; i < bNum; i++) {
            let tVal = {x:0, y:0, Vx:0, vY:0}
            // North
            if (bDir == 0) {
                tVal = {
                    x:(this.cnv.width / bNum) * (i + 0.25), 
                    y:this.cnv.height - this.bSize,
                    vX: Math.random()* 0.8 - 0.4, 
                    vY:-9 + Math.random()* 0.5 - 0.25
                }
            }
            // south
            else if (bDir == 2) { 
                tVal = {
                    x:(this.cnv.width / bNum) * (i + 0.25), 
                    y:0 - this.bSize,
                    vX: Math.random()* 0.8 - 0.4, 
                    vY: 0
                }
            }
            // East
            else if (bDir == 1) { 
                tVal = {
                    x:0 - this.bSize, 
                    y:(this.cnv.height / bNum) * (i + 0.25),
                    vX: 5 + Math.random(),
                    vY: -5 + Math.random()* 2
                }
            }
            // West
            else if (bDir == 3) { 
                tVal = {
                    x:this.cnv.width + this.bSize, 
                    y:(this.cnv.height / bNum) * (i + 0.25),
                    vX: -5 + Math.random(),
                    vY: -5 + Math.random()* 2
                }
            }
            valList.push(tVal)
        }
        return valList
    }

    newBall = (pos={x:100, y:-40, Vx:2, Vy:2}, word="example", stateek=false) => {
        this.bCount += 1
        return new Promise((resolve) => {
            let img = new Image();
            if (!stateek) {
                img.src = 'aperture.svg' //URL.createObjectURL(new Blob([svgData], {type: 'image/svg+xml'}))
            } else {
                img.src = 'star.svg'
                word = "abcdefg"
                this.bCount -= 1
            }
            img.onload = () => {
                this.balls.push([img, pos, word]);
                resolve();
            };
        });
    }

    waitForAllBallsLoaded() {
        return new Promise((resolve) => {
            const check = () => {
                if (this.balls.length === this.bCount) {
                    resolve();
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    }

    async bootGame() {
        await this.waitForAllBallsLoaded();
        requestAnimationFrame(this.updateBalls);
    }
}

async function init() {

    genInit()

    docResized()

    if ('topic' in urlData) {topic = urlData.topic}
    else {topic="wordset1"} //Default

    try {
        const txt = await (await fetch("words.csv")).text();
        wordDict = csvToDict(txt);
        wordDict[topic] = wordDict[topic]
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    } catch {
        wordDict[topic] = ["error with wordset"];
    }

    game = new gameCanvas("gamCnv")
    newWord()
}

function docResized() {
    let tempA = document.body
    let tempB = getWidth(tempA) / getHeight(tempA)
    hz = false
    if (tempB > 2) {
        hz = true
        document.getElementById("gamCnv").style.height = `${getHeight(tempA) - 10}px`
        document.getElementById("gamCnv").style.width = `${getHeight(tempA) * 2 - 10}px`
    } else if (tempB < 0.7) {
        document.getElementById("gamCnv").style.height = `${getWidth(tempA) * 0.8 - 10}px`
        document.getElementById("gamCnv").style.width = `${getWidth(tempA) - 10}px`
    } else {
        if (tempB >= 1) {hz = true}
        document.getElementById("gamCnv").style.height = `${getHeight(tempA) - 10}px`
        document.getElementById("gamCnv").style.width = `${getWidth(tempA) - 10}px`        
    }
}

async function newWord(bNum=3) {
    answer = wordDict[topic].shift()

    game = new gameCanvas("gamCnv")

    let randDirs = game.throwRand(bNum, Math.floor((Math.random() * 4)));
    let tempProm = []
    for (let i=1; i < bNum; i++) {
        tempProm.push(game.newBall(randDirs[i], wordDict[topic][i-1]))
    }
    tempProm.push(game.newBall(randDirs[0], answer))

    wordDict[topic] = wordDict[topic]
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    wordDict[topic].push(answer)
    
    await Promise.all(tempProm)
    // [game.newBall({ x: 0, y: 0, vX:0, vY: 0}, "lel")]
    game.bootGame()
}

function roundLost() {
    // if (game.gameOver) {return}
    game.gameOver = true
    ret("l")
    // newWord()
}

function roundWon() {
    if (game.gameOver) {return}
    game.gameOver = true
    ret("w")
    // newWord()
}
