// calculate spell points for D&D 5e variant rules (DMG p.288)

var SpellPoints = {}; //prevent global names

SpellPoints.Calc = (function () {

var pointsPerLevel = [ 0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83, 83,
    94, 84, 107, 114, 123, 133 ],
// var castingCost = [ 0, 2, 3, 5, 6, 7, 9, 10, 11, 13 ];

// Spellcaster titles for each school of magic
casterTitles = [
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
],

schoolPics = [
    "abjuration.jpg",
    "conjuration.jpg",
    "divination.jpg",
    "enchantment.jpg",
    "evocation.jpg",
    "illusion.jpg",
    "necromancy.jpg",
    "transmutation.jpg"
],

// max is maximum for each long rest at given level, not for all possible points
max = 0,
totalCost = 0,
remaining = 0,
castable,
recovery = 0,
points = 0,
addedPoints = 0,
limitFlag = [],
zeroCasts = [],
spellId = 0;

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
        // ensures 1-cast spells will not be cast twice in same session
        zeroCasts.push(cost);
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
    if (zeroCasts.indexOf(points) > -1) {
        castable = false;
    } else if (points <= remaining) {
        castable = true;
    } else {
        castable = false;
    }
}

// resets calculator to maximum spell points for selected level and zeros/resets
// casting-dependent variables
function getMaxPoints() {
    // reset variables and grab caster level
    castable = true, totalCost = 0, recovery = 0, addPoints = 0,
    addPoints = 0,limitFlag = [], zeroCasts = [];
    var index = document.getElementById("casterLevel").selectedIndex;
    max = Number(pointsPerLevel[index + 1]);
    remaining = max;
    // post results
    document.getElementById("casting").innerHTML = totalCost;
    document.getElementById("max").innerHTML = max;
    document.getElementById("remaining").innerHTML = remaining;
    document.getElementById("warning").innerHTML = "";
    changeColor("remaining", (remaining <= (max / 2)));
    return max;
}

// display school symbol and level title
function setCasterTitle() {
    var level = Number(document.getElementById("casterLevel").selectedIndex + 1);
    var school = Number(document.getElementById("casterSchool").selectedIndex);
    var title = "";
    if (level === 1) {
        title = casterTitles[school][0];
    } else if (level > 1 && level < 6) {
        title = casterTitles[school][1];
    } else if (level > 5 && level < 14) {
        title = casterTitles[school][2];
    } else if (level > 13 && level < 18) {
        title = casterTitles[school][3];
    } else if (level > 17) {
        title = casterTitles[school][4];
    }
    document.getElementById("casterTitle").innerHTML = title;
    document.getElementById("schoolImage").innerHTML = "<img src=\"images/" +
        schoolPics[school] + "\">";
}

// cast a spell then recalculate spell points
function castSpell(spell) {
    spellCost = Number(spell);
    // check if the spell is castable
    flagCastable(spellCost);
    if (castable) {
        totalCost += spellCost;
        remaining -= spellCost;
        if (remaining < 1) {
            remaining = 0;
        }
        // post results
        document.getElementById("casting").innerHTML = totalCost;
        document.getElementById("remaining").innerHTML = remaining;
        // change color of remaining when below half max
        changeColor("remaining", (remaining <= (max / 2)));
        document.getElementById("warning").innerHTML = "";
    } else {
        document.getElementById("warning").innerHTML =
        "<p class=\"warning\">Not enough points for that spell!</p>";
    }
    genTable(remaining);
    spellId = 0;
}

// ensure table resets on reset of max points
// then initialize school symbol and level title
genTable(getMaxPoints());
setCasterTitle();

// EVENTS

// cast spell when clicking a spell level
function clickSpell(elementId) {
    document.getElementById(elementId).onclick = function () {
    spellId = this.value;
    // establish whether 1-cast limit spells have been cast
    limitFlag.push(spellId);
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
    remaining = recovery;
    document.getElementById("remaining").innerHTML = remaining;
    genTable(remaining);
};

// add spell points manually
document.getElementById("addPoints").onkeypress = function(event){
    if (event.key == "Enter" && Number.isInteger(Number(this.value))) {
    addedPoints = Number(document.getElementById("addPoints").value);
    remaining += addedPoints;
    document.getElementById("remaining").innerHTML = remaining;
    genTable(remaining);
    } else {
        console.warn("addPoints only takes integers!");
    }
    addedPoints = 0;
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
    getMaxPoints: getMaxPoints,
    arcaneRecovery: arcaneRecovery,
    castingLimit: castingLimit,
    castSpell: castSpell,
    changeColor: changeColor,
    genTable: genTable,
    setCasterTitle: setCasterTitle
};

}());
