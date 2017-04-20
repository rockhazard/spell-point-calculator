// calculate spell points for D&D 5e variant rules (DMG p.288)

var pointsPerLevel = [ 0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 
    94, 84, 107, 114, 123, 133 ];
// var castingCost = [ 0, 2, 3, 5, 6, 7, 9, 10, 11, 13 ];

var max = 0;
var totalCost = 0;
var remaining = 0;
var castable;
var recovery = 0;
var flagRecovery = false;

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
    document.getElementById("remaining").innerHTML = remaining;
    return remaining;
}

// calculates max remaining castings for each given spell level
function genTable(base) {
    var $1Remain = Math.floor(base / 2);
    var $2Remain = Math.floor(base / 3);
    var $3Remain = Math.floor(base / 5);
    var $4Remain = Math.floor(base / 6);
    var $5Remain = Math.floor(base / 7);
    var $6Remain = Math.floor(base / 9);
    var $7Remain = Math.floor(base / 10);
    var $8Remain = Math.floor(base / 11);
    var $9Remain = Math.floor(base / 13);

    var remainder = [ $1Remain, $2Remain, $3Remain, $4Remain, $5Remain, 
        $6Remain, $7Remain, $8Remain, $9Remain ];

    // fill table with remaining castings per level
    for (var i = 0; i < remainder.length; i++) {
        document.getElementById("Level{0}Castings".f(i + 1)).innerHTML =
            remainder[i];
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
    document.getElementById("max").innerHTML = max;
    document.getElementById("remaining").innerHTML = max;
    return max;
}

// recalculate spell points after casting a spell
function getSpellCost(spell) {
    spell = Number(spell);
    // check if the spell is castable
    flagCastable(spell);
    if (castable) {
        totalCost += spell;
        // inject recovery points if arcane recovery button clicked
        if (flagRecovery) {
            remaining = recovery - spell;
            recovery -= spell;
        } else {
            remaining = Number(max) - totalCost;
        }
        // post results
        document.getElementById("casting").innerHTML = totalCost;
        document.getElementById("remaining").innerHTML = remaining;
        genTable(remaining);
    }
}

// perform arcane recovery during a short rest
document.getElementById("recovery").onclick = function(){
    recovery = arcaneRecovery();
    flagRecovery = true;
};

// set/reset spell point calculations according to caster level
document.getElementById("casterLevel").onclick = function(){
    // reset calculations
    genTable(getMaxPoints());
    remaining = max;
    totalCost = 0;
};