var wordDict = {}
var streak = 0
var topics = []
var answer = ""
var aIPA = ""
var game = ''

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
        this.bSize = 50 * (this.yMod + this.xMod) / 2        
        this.gravity = 9.81 /60
        
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

    getNewXY(tVal, deltaTime) {
        // x y vX vY r
        tVal.x += tVal.vX * this.xMod * deltaTime * 60;
        tVal.y += tVal.vY * this.yMod * deltaTime * 60;

        if (tVal.vX < 0) {
            tVal.r += 30 * deltaTime
        } else {
            tVal.r -= 30 * deltaTime
        }

        tVal.vY += (Math.abs(tVal.r/90) + 1) * 0.5 * this.gravity * deltaTime
        // tVal.y = 40

        if (Math.abs(tVal.r) < 30 && tVal.vX < 2) {
            // ret(tVal.r)
            tVal.vX += tVal.r * 0.15 * deltaTime
            
        } else if (Math.abs(tVal.vX) < 0.5) {
            tVal.vX = tVal.vX * -8
        } else {
            tVal.vX = tVal.vX * 0.9
        }

        if (tVal.x < -10) {
            tVal.vX = 0.25
            tVal.r = 25
        } else if (tVal.x > this.cnv.width - this.bSize + 10 && tVal.vX > 0) {
            tVal.vX = -0.25
            tVal.r = -25
        }

        return tVal
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
                
                // ball[1] = {
                //     x:300, 
                //     y:300,
                //     vX: 0, 
                //     vY: 0,
                //     r: 2
                // }
                ball[1] = this.getNewXY(ball[1], deltaTime)

                this.ctx.fillStyle = "white";
                this.ctx.font = `${12 * ((this.xMod + this.yMod) / 2)}px OpenDyslexic`;
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";

                this.ctx.save()
                this.ctx.translate(ball[1].x+this.bSize/2, ball[1].y+this.bSize/2);
                this.ctx.rotate(2.34 + ball[1].r / 57.2)
                this.ctx.drawImage(ball[0],  this.bSize/2,  -this.bSize/2, -this.bSize, this.bSize);
                this.ctx.restore()
                
                this.ctx.fillText(ball[2], ball[1].x + this.bSize / 2, ball[1].y + this.bSize / 2)
                
            }
            else {this.ctx.drawImage(ball[0], ball[1].x, ball[1].y, this.bSize, this.bSize);}
            
            if (ball[1].y > this.cnv.height + this.bSize*1.25) {
                hitBottom += 1
            }

        }
        if (hitBottom == this.bCount) {
            roundLost(true);
            
        } else {
            requestAnimationFrame(this.updateBalls)
        }
    }

    throwRand(bNum, bDir=2) {
        let valList = []
        for (let i=0; i < bNum; i++) {
            let tVal = {x:0, y:0, vX:0, vY:0, r:0}
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
                    x:25 + ((this.cnv.width - 50) / bNum) * (i + 0.5), 
                    y:0 - this.bSize - Math.random()*100,
                    // y:0,
                    vX: (1 + 3*Math.random()) * (2 * Math.round(Math.random()) - 1), 
                    vY: 0.5 * Math.random(),
                    r:0
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

    newBall = (pos={x:100, y:-40, vX:2, vY:2}, word="example", stateek=false) => {
        this.bCount += 1
        return new Promise((resolve) => {
            let img = new Image();
            if (!stateek) {
                img.src = 'SVG/leaf' + randInt(12) + '.svg' //URL.createObjectURL(new Blob([svgData], {type: 'image/svg+xml'}))
            } else {
                img.src = 'SVG/star.svg'
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

    if ('topics' in urlData) {topics = urlData.topics}
    else {topics=["wordset1", "wordset2"]} //Default

    topics = ['əʊ', 'ɒ', 'uː']
    
    const txt = await (await fetch("words.csv")).text();
    wordDict = csvToDict(txt);

    for (let tempA of topics) {
        let tempB = new Audio(`Audio/sfx_${md5(tempA)}.mp3`)
        tempB.id = `sfx_${tempA}`
        document.body.appendChild(tempB)
    }

    game = new gameCanvas("gamCnv")
}

function spamAudio() {
    for (let tempA of topics) {
        let tempB = document.getElementById(`sfx_${tempA}`)
        tempB.play()
        tempB.pause()
    }
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
    topics = shuffleArray(topics)
    aIPA = topics.pop()
    answer = wordDict[aIPA].shift()
    wordDict[aIPA].push(answer)

    game = new gameCanvas("gamCnv")

    let randDirs = game.throwRand(bNum, /* Math.floor(Math.random() * 4) */);
    let tempProm = []

    for (let i=1; i < bNum; i++) {
        tempProm.push(game.newBall(randDirs[i], wordDict[topics[randInt(topics.length)]][i-1]))
    }
    tempProm.push(game.newBall(randDirs[0], answer))

    topics.push(aIPA)

    await Promise.all(tempProm)
    // [game.newBall({ x: 0, y: 0, vX:0, vY: 0}, "lel")]

    document.getElementById("introAudio").play()
    document.getElementById("introAudio").onended = function() {
        document.getElementById(`sfx_${aIPA}`).playbackRate = 0.5
        document.getElementById(`sfx_${aIPA}`).play()
    };
    
    game.bootGame()
}



function roundLost(tByFloor=false) {
    // if (game.gameOver) {return}
    game.gameOver = true
    ret("l")
    if (tByFloor) {newWord()}
}

function roundWon() {
    if (game.gameOver) {return}
    game.gameOver = true
    ret("w")
    // newWord()
}
