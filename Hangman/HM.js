const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
var wordDict = {}
var strikes = 0
var hideWord = []
var shownWord = []
var alreadyPressed = []
var streak = 0
var elImpass = false
var topic = ""
var urlData = {};

function init() {
    docResized()
    try {
    var params = location.href.split('?')[1].split('&');
    for (x in params) {urlData[params[x].split('=')[0]] = params[x].split('=')[1];}
    } catch {ret('No external args')}
    if ('topic' in urlData) {topic = urlData.topic}
    else {topic="wordset1"} //Default
    fetch("words.csv").then((res) => res.text()).then((txt) => {
        wordDict = csvToDict(txt)
        // Shuffler
        try {
            wordDict[topic] = wordDict[topic]
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        } catch {wordDict[topic] = ["error with wordset"]}

        newWord()

        for (i=0; i<=10; i++) {
        //strikes += 1
        //drawNext()
    }

    }).catch((e) => console.error(e));
}

function docResized() {
    let tempA = document.body
    let tempB = getWidth(tempA) / getHeight(tempA)
    document.getElementById("test").innerHTML = tempB
    if (tempB > 1.4) {
       document.getElementById("fullOut").style = `width:${getHeight(tempA) * 1.3}px !important;`
    } else if (tempB < 0.8) {
        document.getElementById("fullOut").style = `height:${getWidth(tempA) * 0.8}px !important;`
    }
}

function getWidth(id) {
    if (typeof id == "string") {id = document.getElementById(id)}; 
    return Math.floor(document.defaultView.getComputedStyle(id).width.replace("px", ""))
}

function getHeight(id) {
    if (typeof id == "string") {id = document.getElementById(id)}; 
    return Math.floor(document.defaultView.getComputedStyle(id).height.replace("px", ""))
}

function newWord() {
    hideWord = wordDict[topic].shift().trim().split("")
    wordDict[topic].push(hideWord)
    alreadyPressed = []
    shownWord = []
    strikes = 0
    document.getElementById("hmImgContainer").innerHTML = ""
    document.getElementById("hmUsedLetters").innerHTML = ""
    for (let tempA of hideWord) {
        if (tempA == " ") {shownWord.push("/<wbr>")}
        else {shownWord.push("_")}
    }
    document.getElementById("hmTxt").innerHTML = shownWord.join("&numsp;")

}

function keyPressed() {
    let tempA = document.getElementById("hmKeypress").value.toLowerCase()
    if (tempA.length > 1) {tempA = tempA.slice(0,1)}
    if (elImpass) {
        document.getElementById("winLossDiv").style.display = "none"
        elImpass = false
        newWord()
    } else if (alphabet.includes(tempA) && !(alreadyPressed.includes(tempA))) {
        alreadyPressed.push(tempA)
        if (hideWord.includes(tempA)) {
            //Good Guess
            for (let i=0; i<hideWord.length; i++) {
                if (hideWord[i] == tempA) {shownWord[i] = tempA}
            }
            if (!(shownWord.includes("_"))) {gameWon()}
            document.getElementById("hmTxt").innerHTML = shownWord.join("&numsp;")
        } else {
            //Bad Guess
            if (!(strikes == 9)){
                strikes += 1
                drawNext()
            } else {
                gameLost()
            }
        }
        document.getElementById("hmUsedLetters").innerHTML = alreadyPressed.join(" ")
    }

    document.getElementById("hmKeypress").value = ""
}

function gameLost() {
    tempA = document.getElementById("winLossDiv")
    streak = 0
    ret(hideWord)
    tempA.innerHTML = `<p class="wlHeader">You lost. . .</p>
                <p>The answer was : <span style="font-size: larger;">${hideWord.join("").replace("/", " ")}</span></p>
                <p>Click anywhere to try again. . .</p>`
    tempA.style.display = "block"
    elImpass = true
}

function gameWon() {
    tempA = document.getElementById("winLossDiv")
    streak +=1
    tempA.innerHTML = `<p class="wlHeader">You won!</p>
                <p>The answer was : <span style="font-size: larger;">${hideWord.join("").replace("/", " ")}</span></p>
                <p>You have a streak of ${streak} correct answers!</p>
                <p>Click anywhere to continue. . .</p>`
    tempA.style.display = "block"
    elImpass = true
}

function readFile(loc, cb=function(txt){console.log(txt)}) {
    fetch(loc)
    .then(response => response.text())
    .then(txt => cb(txt))
}

function drawNext() {
    let tempA = document.createElement("svg")
    document.getElementById("hmImgContainer").appendChild(tempA)
    tempA.outerHTML = baseSVG.replace("<!--inp-->", insertSVG[strikes-1])//`<img id="img${strikes}" src="SVG/HD${strikes}.svg" class="hmImg animLine">`
    let tempB = document.getElementById(`img${strikes}`)
    tempB.classList.add("animLine")
}

function csvToDict(csvTxt) {
    let csvLst = []
    for (let tempA of csvTxt.split("\n")) {
        csvLst.push(tempA.trim().split(", "))
    }
    let csvDict = {}
    for (let tempA of csvLst) {
        let tempB = tempA.splice(0, 1)
        csvDict[tempB] = tempA
    }
    return csvDict
}

function ret(txt="hi") {console.log(txt)}

function fpClick() {
    ret('click')
    if (elImpass) {
        document.getElementById("winLossDiv").style.display = "none"
        elImpass = false
        newWord()
    }
}

const baseSVG = `<svg class="hmImg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 77.88 122.42">
  <defs>
    <style>
      .cls-1 {
        fill: none;
        stroke: #231f20;
        stroke-linecap: round;
        stroke-miterlimit: 10;
      }
    </style>
  </defs>
  <g>
    <!--inp-->
    <rect style="fill:none;" width="80" height="125"/>
  </g>
</svg>`

const insertSVG = [
    `<path id="img1" class="cls-1" d="M.5,121.1c7.68,0,7.68.71,15.37.71s7.69-.31,15.37-.31,7.69.37,15.38.37,7.69.06,15.38.06,7.69-.06,15.38-.06"/>`,

    `<path id="img2" class="cls-1" d="M11.73,121.29c0-29.62,3.2-29.63,3.2-59.25s-2-29.62-2-59.25"/>`,

    `<path id="img3" class="cls-1" d="M12.98,2.4c21.38,0,21.38-1.35,42.75-1.35"/>`,
    
    `<path id="img4" class="cls-1" d="M56.35.5c0,5.75.59,5.75.59,11.5"/>`,
    
    `<path id="img5" class="cls-1" d="M65.66,20.25c0,4.56-5.72,9.5-10.56,9.5s-6.82-4.95-6.82-9.5,1.99-8.21,6.82-8.21,10.56,3.66,10.56,8.21Z"/>`,

    `<path id="img6" class="cls-1" d="M57.26,29.25c0,11.88-1.79,11.88-1.79,23.76"/>`,
    
    `<path id="img7" class="cls-1" d="M57.25,34.08c5.54,4.39,5.9,3.94,11.44,8.33"/>`,
    
    `<path id="img8" class="cls-1" d="M57.13,33.36c-5.54,4.39-5.52,4.42-11.06,8.81"/>`,
    
    `<path id="img9" class="cls-1" d="M54.96,52.61c-5.54,4.39-5.92,3.91-11.46,8.3"/>`,
    
    `<path id="img10" class="cls-1" d="M63.52,62.55c-4.16-4.68-3.71-5.08-7.87-9.76"/>`
]