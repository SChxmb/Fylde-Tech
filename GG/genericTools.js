var urlData = {};

function ret(txt="hi") {
    console.log(txt + "; ")
    document.getElementById("test").innerHTML += txt + "; " 
}

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

function genInit() {
    try {
        var params = location.href.split('?')[1].split('&');
        for (x in params) {urlData[params[x].split('=')[0]] = params[x].split('=')[1];}
    } catch {
        //ret('No external args')
    }
    
}

function readFile(loc, cb=function(txt){console.log(txt)}) {
    fetch(loc)
    .then(response => response.text())
    .then(txt => cb(txt))
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

function getWidth(id) {
    if (typeof id == "string") {id = document.getElementById(id)}; 
    return Math.floor(document.defaultView.getComputedStyle(id).width.replace("px", ""))
}

function getHeight(id) {
    if (typeof id == "string") {id = document.getElementById(id)}; 
    return Math.floor(document.defaultView.getComputedStyle(id).height.replace("px", ""))
}

function randInt(end, start=0) {
    return (start + Math.floor(Math.random() * end))
}

function linearSearch(searchFor, lst) {
    for (let i = 0; i < lst.length; ++i) {
        // If target found return and exit program
        if (lst[i] === searchFor) {
            return i;
        }
    }
    return -1
}

function shuffleArray(array) {
    return array.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

function md5(text) {
    return CryptoJS.MD5(text).toString();
}