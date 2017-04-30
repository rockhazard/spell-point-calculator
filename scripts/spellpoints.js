// calculate spell points for D&D 5e variant rules (DMG p.288)

var SpellPoints = {}; //prevent global names

SpellPoints.Calc = (function () {

var pointsPerLevel = [ 0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83, 
    94, 84, 107, 114, 123, 133 ];
// var castingCost = [ 0, 2, 3, 5, 6, 7, 9, 10, 11, 13 ];

// Spellcaster titles for each school of magic
var casterTitles = [
    Abjuration = [
        "Prestidigitator",
        "Abjurer",
        "Warden",
        "Glyph Guard",
        "Sage of Circles"
    ],

    Conjuration = [
        "Prestidigitator",
        "Conjurer",
        "Spell Caller",
        "True Summoner",
        "Sage of Names"
    ],

    Divination = [
        "Prestidigitator",
        "Diviner",
        "Seer",
        "Mystic",
        "Sage of Eyes"
    ],

    Enchantment = [
        "Prestidigitator",
        "Enchanter",
        "Glamor Guide",
        "Entrancer",
        "Sage of Charms"
    ],

    Evocation = [
        "Prestidigitator",
        "Evoker",
        "Spell Gyre",
        "Cataclysm",
        "Sage of Storms"
    ],

    Illusion = [
        "Prestidigitator",
        "Illusionist",
        "Seemling",
        "Shadow Master",
        "Sage of Phantoms"
    ],

    Necromancy = [
        "Prestidigitator",
        "Necromancer",
        "Gravebane",
        "Hex Lord",
        "Sage of Reaping"
    ],

    Transmutation = [
        "Prestidigitator",
        "Transmuter",
        "Thaumaturgist",
        "Metamorph",
        "Sage of Seasons"
    ]
];

var max = 0;
var totalCost = 0;
var remaining = 0;
var castable;
var recovery = 0;
var points = 0;
var flagRecovery = false;
var flagAddPoints = false;
var addedPoints = 0;
var limitFlag = [];
var spellId = 0;

// string formatting function, aliased to string.f
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// switch number to either red or black
function changeColor(id, condition) {
    var element = document.getElementById(id);
    if (condition) {
        element.style.color = "red";
    } else {
        element.style.color = "black";
    }
}

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
    changeColor("remaining", (remaining <= (max / 2)));
    return remaining;
}

// enforces rule that spell point users only have one casting at levels 6 - 9
function castingLimit(cost) {
    if (limitFlag.indexOf(String(cost)) > -1){
        return 0;
    } else 
    if (remaining >= cost) {
        return cost;
    } else {
        return 0;
    }
}

// calculates max remaining castings for each given spell level
function genTable(base) {
    var $1Castings = Math.floor(base / 2);
    var $2Castings = Math.floor(base / 3);
    var $3Castings = Math.floor(base / 5);
    var $4Castings = Math.floor(base / 6);
    var $5Castings = Math.floor(base / 7);
    // Levels 6-0 only allow one casting per long rest
    var $6Castings = Math.floor(castingLimit(9) / 9);
    var $7Castings = Math.floor(castingLimit(10) / 10);
    var $8Castings = Math.floor(castingLimit(11) / 11);
    var $9Castings = Math.floor(castingLimit(13) / 13);

    var remainder = [ $1Castings, $2Castings, $3Castings, $4Castings, 
                    $5Castings, $6Castings, $7Castings, $8Castings, 
                    $9Castings ];

    // fill table data with remaining castings per level
    for (var i = 0; i < remainder.length; i++) {
        var casting = document.getElementById("Level{0}Castings".f(i + 1));
        casting.innerHTML = remainder[i];
        changeColor("Level{0}Castings".f(i + 1), (remainder[i] < 1));
    }

    return remainder;
}

// prevents calculator from casting spells with too few points remaining
function flagCastable(points) {
    // bug: won't let 6-9 spells cast once, because index included before cast
    // if (limitFlag.indexOf(String(points)) > -1) {
    //     castable = false;
    // } else 
    if (points <= remaining) {
        castable = true;
    } else {
        castable = false;
    }
}

// resets calculator to maximum spell points for selected level and zeros/resets
// casting-dependent variables
function getMaxPoints() {
    castable = true, totalCost = 0, recovery = 0, addPoints = 0;
    document.getElementById("casting").innerHTML = totalCost;
    var index = document.getElementById("casterLevel").selectedIndex;
    max = Number(pointsPerLevel[index + 1]);
    remaining = max;
    document.getElementById("max").innerHTML = max;
    document.getElementById("remaining").innerHTML = max;
    document.getElementById("warning").innerHTML = "";
    changeColor("remaining", (remaining <= (max / 2)));
    addPoints = 0;
    limitFlag = [];
    return max;
}

// apply school symbol and level title according to level and school selections
function setCasterTitle() {
    var level = Number(document.getElementById("casterLevel").selectedIndex + 1);
    var school = Number(document.getElementById("casterSchool").selectedIndex);
    var title = "";
    if (level === 1) {
        title = casterTitles[school][0];
    } else if (level > 1 && level < 9) {
        title = casterTitles[school][1];
    } else if (level > 8 && level < 15) {
        title = casterTitles[school][2];
    } else if (level > 14 && level < 20) {
        title = casterTitles[school][3];
    } else if (level === 20) {
        title = casterTitles[school][4];
    }
    document.getElementById("casterTitle").innerHTML = title;
    document.getElementById("schoolImage").innerHTML = "<img src=\"images/" + 
        schoolPics[school] + "\">";
}

// recalculate spell points after casting a spell
function castSpell(spell) {
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
            remaining = (max + recovery + addPoints) - totalCost;
        }
        // post results
        document.getElementById("casting").innerHTML = totalCost;
        document.getElementById("remaining").innerHTML = remaining;
        // change color of remaining when below half max
        changeColor("remaining", (remaining <= (max / 2)));
        genTable(remaining);
        document.getElementById("warning").innerHTML = "";
    } else if (flagAddPoints === false) {
        document.getElementById("warning").innerHTML = "<p class=\"warning\">Not enough points for that spell!</p>";
    }
    spellId = 0;
}

// ensure table resets on reset of max points and school symbol is loaded
genTable(getMaxPoints());
setCasterTitle();

// events

// perform casting when clicking a spell level
function clickSpell(elementId) {
    document.getElementById(elementId).onclick = function () {
    spellId = this.value;
    limitFlag.push(spellId);
    // if (spellId > 7) {
    //     limitFlag = true;
    // }
    castSpell(spellId);
    };
}

clickSpell("spellLevel1");
clickSpell("spellLevel2");
clickSpell("spellLevel3");
clickSpell("spellLevel4");
clickSpell("spellLevel5");
clickSpell("spellLevel6");
clickSpell("spellLevel7");
clickSpell("spellLevel8");
clickSpell("spellLevel9");

// perform arcane recovery during a short rest
document.getElementById("recovery").onclick = function(){
    recovery = arcaneRecovery();
    flagRecovery = true;
};

// add spell points manually
document.getElementById("addPoints").onkeypress = function(event){
    if (event.key == "Enter" && Number.isInteger(Number(this.value))) {
    addedPoints = Number(document.getElementById("addPoints").value);
    flagAddPoints = true;
    castSpell(addedPoints);
    } else {
        console.warn("addPoints only takes integers!");
    }
};

// set/reset spell point calculations according to caster level
document.getElementById("casterLevel").onclick = function(){
    // reset calculations and title
    setCasterTitle();
    genTable(getMaxPoints());
    totalCost = 0;
};

// set caster school and title
document.getElementById("casterSchool").onclick = function(){
    setCasterTitle();
};

// make functions available for testing
return {
    flagCastable: flagCastable,
    arcaneRecovery: arcaneRecovery,
    genTable: genTable,
    getMaxPoints: getMaxPoints,
    castSpell: castSpell
};

}());