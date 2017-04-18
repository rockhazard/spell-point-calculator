// calculate spell points for D&D 5e variant rules (DMG p.288)

var pointsPerLevel = [ 0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 
    94, 84, 107, 114, 123, 133 ];
// var castingCost = [ 0, 2, 3, 5, 6, 7, 9, 10, 11, 13 ];

var max = 0;
var totalCost = 0;
var remaining = 0;

// string formatting function
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// create a new child element with text content
function insertElement(parentElementID, newElement, newElementContent) {
    var parent = document.getElementById(parentElementID);
    var child = document.createElement(newElement);
    // simple insertion of content
    // child.innerHTML = newElementContent;
    // parent.appendChild(child);

    // longer but more exact insertion method
    // allows direct manipulation of the textNode object:
    var data = document.createTextNode(newElementContent);
    child.appendChild(data);
    parent.appendChild(child);
}


function getMaxPoints() {
    var index = document.getElementById("casterLevel").selectedIndex;
    max = Number(pointsPerLevel[index]);
    document.getElementById("maxPoints").innerHTML = max;
}


function getSpellCost(x) {
    totalCost += Number(x);
    remaining = Number(max) - totalCost; 
    document.getElementById("remaining").innerHTML = remaining;
    document.getElementById("casting").innerHTML = totalCost;
    if (x > remaining) {
        document.getElementById("remaining").innerHTML = "Not enough points!";
        remaining += Number(x);
    }

    // remaining spells if all points are expended on given spell level
    var $1Remain = Math.floor(remaining / 2);
    var $2Remain = Math.floor(remaining / 3);
    var $3Remain = Math.floor(remaining / 5);
    var $4Remain = Math.floor(remaining / 6);
    var $5Remain = Math.floor(remaining / 7);
    var $6Remain = Math.floor(remaining / 9);
    var $7Remain = Math.floor(remaining / 10);
    var $8Remain = Math.floor(remaining / 11);
    var $9Remain = Math.floor(remaining / 13);

    var remainder = [ $1Remain, $2Remain, $3Remain, $4Remain, $5Remain, 
        $6Remain, $7Remain, $8Remain, $9Remain ];

    // fill table with remaining castings per level
    for (var i = 0; i < remainder.length; i++) {
        document.getElementById("Level{0}Castings".f(i + 1)).innerHTML =
            remainder[i];
    }
}

document.getElementById("casterLevel").onclick = function(){
    getMaxPoints();
};