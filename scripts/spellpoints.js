// calculate spell points for D&D 5e variant rules (DMG p.288)

var pointsPerLevel = [ 0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 
    94, 84, 107, 114, 123, 133 ];
// var castingCost = [ 0, 2, 3, 5, 6, 7, 9, 10, 11, 13 ];

var max = 0;
var totalCost = 0;
var remaining = 0;
var castable;
var recovery = 0;
var points = 0;
var flagRecovery = false;
var flagAddPoints = false;
var addedPoints = 0;

// string formatting function, aliased to string.f
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// adds half the caster's max points to remaining pool via arcane recovery
function arcaneRecovery() {
    var recover = Math.floor(max / 2);
    if (recover + remaining >= max) {
        remaining = max;
    } else {
        remaining += recover;
    }
    genTable(remaining);
    document.getElementById("remaining").innerHTML = remaining;
    return remaining;
}

// calculates max remaining castings for each given spell level
function genTable(base) {
    var $1Castings = Math.floor(base / 2);
    var $2Castings = Math.floor(base / 3);
    var $3Castings = Math.floor(base / 5);
    var $4Castings = Math.floor(base / 6);
    var $5Castings = Math.floor(base / 7);
    var $6Castings = Math.floor(base / 9);
    var $7Castings = Math.floor(base / 10);
    var $8Castings = Math.floor(base / 11);
    var $9Castings = Math.floor(base / 13);

    var remainder = [ $1Castings, $2Castings, $3Castings, $4Castings, $5Castings, 
        $6Castings, $7Castings, $8Castings, $9Castings ];

    // fill table data with remaining castings per level
    for (var i = 0; i < remainder.length; i++) {
        var casting = document.getElementById("Level{0}Castings".f(i + 1));
        casting.innerHTML = remainder[i];
        // color castings red if no castings remain
        if (remainder[i] < 1) {
            casting.style.color = "red";
        } else {
            casting.style.color = "black";
        }
    }

    return remainder;
}

// prevents calculator from casting spells with too few points remaining
function flagCastable(points) {
    if (points <= remaining) {
        castable = true;
    } else {
        castable = false;
    }
}

function getMaxPoints() {
    castable = true;
    totalCost = 0;
    document.getElementById("casting").innerHTML = totalCost;
    var index = document.getElementById("casterLevel").selectedIndex;
    max = Number(pointsPerLevel[index]);
    remaining = max;
    document.getElementById("max").innerHTML = max;
    document.getElementById("remaining").innerHTML = max;
    return max;
}

// recalculate spell points after casting a spell
function getSpellCost(spell) {
    spellCost = Number(spell);
    // check if the spell is castable
    flagCastable(spellCost);
    if (castable) {
        totalCost += spellCost;
        // inject recovery points if arcane recovery button clicked
        if (flagRecovery) {
            remaining = recovery - spellCost;
            recovery -= spellCost;
        } else if (flagAddPoints) {
            remaining += addedPoints;
            totalCost -= addedPoints;
            max += addedPoints;
            flagAddPoints = false;
        } else {
            remaining = Number(max) - totalCost;
        }
        // post results
        document.getElementById("casting").innerHTML = totalCost;
        document.getElementById("remaining").innerHTML = remaining;
        genTable(remaining);
    }
}

genTable(getMaxPoints());

// perform casting upon clicking a spell level; not yet implemented
document.getElementsByClassName("spellLevel").onclick = function () {
    getSpellCost(this.value);
};

// perform arcane recovery during a short rest
document.getElementById("recovery").onclick = function(){
    recovery = arcaneRecovery();
    flagRecovery = true;
};

// add spell points manually, but broken in Firefox
document.getElementById("addPoints").onkeypress = function(event){
    if (event.key == "Enter") {
    addedPoints = Number(document.getElementById("addPoints").value);
    flagAddPoints = true;
    getSpellCost(addedPoints);
    }
};

// set/reset spell point calculations according to caster level
document.getElementById("casterLevel").onclick = function(){
    // reset calculations
    genTable(getMaxPoints());
    totalCost = 0;
};