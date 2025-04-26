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