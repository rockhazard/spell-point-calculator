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
        "Spell Guard",
        "Abjuror Savant",
        "Abjuror",
        "Abjuror Warden"
    ],

    Conjuration = [
        "Prestidigitator",
        "Spell Caller",
        "Conjurer Savant",
        "Conjurer",
        "Arch Conjurer"
    ],

    Divination = [
        "Prestidigitator",
        "Seer",
        "Diviner Savant",
        "Diviner",
        "Greater Diviner"
    ],

    Enchantment = [
        "Prestidigitator",
        "Spell Guide",
        "Enchanter Savant",
        "Enchanter",
        "Arch Enchanter"
    ],

    Evocation = [
        "Prestidigitator",
        "Channeller",
        "Evoker Savant",
        "Evoker",
        "Greater Evoker"
    ],

    Illusion = [
        "Prestidigitator",
        "Spell Weaver",
        "Illusionist Savant",
        "Illusionist",
        "Greater Illusionist"
    ],

    Necromancy = [
        "Prestidigitator",
        "Spell Grave",
        "Necromancer Savant",
        "Necromancer",
        "Lord Necromancer"
    ],

    Transmutation = [
        "Prestidigitator",
        "Spell Changer",
        "Transmuter Savant",
        "Transmuter",
        "Master Transmuter"
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
var castOnce = false;

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
        changeColor("Level{0}Castings".f(i + 1), (remainder[i] < 1));
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
    max = Number(pointsPerLevel[index + 1]);
    remaining = max;
    document.getElementById("max").innerHTML = max;
    document.getElementById("remaining").innerHTML = max;
    changeColor("remaining", (remaining <= (max / 2)));
    addPoints = 0;
    return max;
}

function getCasterTitle() {
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
            remaining = Number(max) - totalCost;
        }
        // post results
        document.getElementById("casting").innerHTML = totalCost;
        document.getElementById("remaining").innerHTML = remaining;
        // change color of remaining when below half max
        changeColor("remaining", (remaining <= (max / 2)));
        genTable(remaining);
    }
}

// ensure table resets on reset of max points
genTable(getMaxPoints());

// events

// perform casting when clicking a spell level
function clickSpell(elementId) {
    document.getElementById(elementId).onclick = function () {
    castSpell(this.value);
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
    getCasterTitle();
    genTable(getMaxPoints());
    totalCost = 0;
};

// set caster school and title
document.getElementById("casterSchool").onclick = function(){
    getCasterTitle();
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