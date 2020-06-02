// calculate spell points for D&D 5e variant rules (DMG p.288)

var SpellPoints = {};

SpellPoints.Calc = (function () {
    // reference: castingCost = [ 0, 2, 3, 5, 6, 7, 9, 10, 11, 13 ];
    const pointsPerLevel = [
        0, 4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 73, 73, 83,
        83, 94, 84, 107, 114, 123, 133
    ],

        // Spellcaster titles for each school of magic
        // school name is casterTitles[x][0]
        casterTitles = [
            [
                "Abjuration",
                "Prestidigitator",
                "Abjurer",
                "Warden",
                "Glyph Guard",
                "Sage of Circles"
            ],

            [
                "Conjuration",
                "Prestidigitator",
                "Conjurer",
                "Spell Caller",
                "True Summoner",
                "Sage of Names"
            ],

            [
                "Divination",
                "Prestidigitator",
                "Diviner",
                "Seer",
                "Mystic",
                "Sage of Eyes"
            ],

            [
                "Enchantment",
                "Prestidigitator",
                "Enchanter",
                "Glamor Guide",
                "Entrancer",
                "Sage of Charms"
            ],

            [
                "Evocation",
                "Prestidigitator",
                "Evoker",
                "Spell Gyre",
                "Cataclysm",
                "Sage of Storms"
            ],

            [
                "Illusion",
                "Prestidigitator",
                "Illusionist",
                "Seemling",
                "Shadow Master",
                "Sage of Phantasms"
            ],

            [
                "Necromancy",
                "Prestidigitator",
                "Necromancer",
                "Gravebane",
                "Hex Lord",
                "Sage of Reaping"
            ],

            [
                "Transmutation",
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
        ];

    // max is maximum recovered for each long rest at given level, 
    // not for all possible points
    let max = 0,
        totalCost = 0,
        remaining = 0,
        castable,
        recovery = 0,
        addedPoints = 0,
        spellRegister = [],
        zeroCasts = [],
        spellId = 0;

    // FUNCTIONS

    // string formatting function, aliased to "string".f
    String.prototype.format = String.prototype.f = function () {
        var s = this,
            i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };

    // switch number to either red or black
    function changeColor(elementId, test) {
        let element = document.getElementById(elementId);
        if (test) {
            element.style.color = "red";
        } else {
            element.style.color = "black";
        }
    }

    // adds spell points to remaining amount equal to caster level
    function arcaneRecovery() {
        let recover = Number(document.getElementById("casterLevel").selectedIndex + 1);
        if (recover < 3) {
            recover = 2;
        }
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

    // enforces rule that spell point users only have one casting
    // at levels 6 - 9
    function castingLimit(cost) {
        if (spellRegister.indexOf(String(cost)) > -1) {
            // ensures 1-cast spells will not be cast twice in same session
            zeroCasts.push(cost);
            return 0;
        } else if (remaining >= cost) {
            return cost;
        } else {
            return 0;
        }
    }

    // calculates max remaining castings for each given spell level
    function genTable(base) {
        // get casting by dividing max points by sp per casting level
        let $1Castings = Math.floor(base / 2);
        let $2Castings = Math.floor(base / 3);
        let $3Castings = Math.floor(base / 5);
        let $4Castings = Math.floor(base / 6);
        let $5Castings = Math.floor(base / 7);
        // Levels 6-9 only allow one casting per long rest
        let $6Castings = Math.floor(castingLimit(9) / 9);
        let $7Castings = Math.floor(castingLimit(10) / 10);
        let $8Castings = Math.floor(castingLimit(11) / 11);
        let $9Castings = Math.floor(castingLimit(13) / 13);

        let remainder = [$1Castings, $2Castings, $3Castings, $4Castings,
            $5Castings, $6Castings, $7Castings, $8Castings,
            $9Castings
        ];

        // define spell progression as a function of caster type
        // full casters gain a spell level every 2 character levels, etc.
        let progression = 0;
        switch (getCasterType()) {
            case 1: progression = 2;
                break;
            case 2: progression = 4;
                break;
            case 3: progression = 6;
        }

        // fill table data with remaining castings per level
        for (var lvl = 0; lvl < remainder.length; lvl++) {
            let casting = document.getElementById("Level{0}Castings".f(lvl + 1));
            // Determine if caster can cast the processed level.
            // Display null castings for levels player can't access.
            if ((level / progression) > lvl) {
                casting.innerHTML = remainder[lvl];
                changeColor("Level{0}Castings".f(lvl + 1), (remainder[lvl] < 1));
            } else {
                casting.innerHTML = "-";
            }

            // half and third casters start getting spells at 2nd & 3rd level
            // half and third casters can't cast higher than 5th and 4th level
            if (getCasterType() == 2) {
                if (lvl > 4) {
                    casting.innerHTML = "-";
                }
                if (level == 1 && lvl == 0) {
                    casting.innerHTML = "-";
                }

            } else if (getCasterType() == 3) {
                if (lvl > 3) {
                    casting.innerHTML = "-";
                }
                if (level < 3 && lvl < 2) {
                    casting.innerHTML = "-";
                }
            }
        }

        return remainder;
    }

    // prevents calculator from casting spells while too few points remain
    // and prevents more than 1 casting of spell levels 6 - 9 in a session
    function flagCastable(points) {
        if (zeroCasts.indexOf(points) > -1) {
            castable = false;
        } else if (points <= remaining) {
            castable = true;
        } else {
            castable = false;
        }
    }

    // retrieves caster type of Full, Half, or Third to assist max point setting
    function getCasterType(casterType) {
        var casterType = (typeof casterType !== 'undefined') ? casterType :
            document.getElementsByName('casterType');
        for (i = 0; i < casterType.length; i++) {
            if (casterType[i].checked) {
                return Number(casterType[i].value);
            }
        }
    }

    // resets calculator to maximum spell points and resets session variables
    function getMaxPoints() {
        // reset variables and grab caster level
        castable = true, totalCost = 0, recovery = 0, addPoints = 0,
            addedPoints = 0, spellRegister = [], zeroCasts = [];
        casterType = getCasterType();
        // level var also supplies genTable
        level = Number(document.getElementById("casterLevel").selectedIndex) + 1;
        let cLevel = Math.floor(level / casterType);
        max = Math.floor(pointsPerLevel[cLevel]);
        // minimum spell points allowed
        if (max < 3) {
            max = 4;
        }

        remaining = max;
        // post results
        document.getElementById("casting").innerHTML = totalCost;
        document.getElementById("max").innerHTML = max;
        document.getElementById("remaining").innerHTML = remaining;
        document.getElementById("warning").innerHTML = "";
        changeColor("remaining", (remaining <= (max / 2)));
        return max;
    }

    // find and display school symbol and level title
    function setCasterTitle() {
        level = Number(document.getElementById("casterLevel").selectedIndex + 1);
        var school = Number(document.getElementById("casterSchool").selectedIndex);
        var title = "";
        if (level === 1) {
            title = casterTitles[school][1];
        } else if (level >= 2 && level <= 5) {
            title = casterTitles[school][2];
        } else if (level >= 6 && level <= 13) {
            title = casterTitles[school][3];
        } else if (level >= 14 && level <= 17) {
            title = casterTitles[school][4];
        } else if (level >= 18) {
            title = casterTitles[school][5];
        }
        document.getElementById("casterTitle").innerHTML = "Title: \n" + title;
        document.getElementById("schoolImage").innerHTML = "<img src=\"images/" +
            schoolPics[school] + "\" height=\"380\" />";
    }

    // cast a spell then recalculate spell points and castings
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

    // initializes max points, tables, and school symbol
    genTable(getMaxPoints());
    setCasterTitle();

    // EVENTS

    // cast spell when clicking a spell level
    function clickSpell(elementId) {
        document.getElementById(elementId).onclick = function () {
            var level = elementId.substr(10, 1);
            var casting = document.getElementById("Level{0}Castings".f(level));
            // Only cast if player has access to spell level.
            if (casting.innerHTML !== "-") {
                spellId = this.value;
                // register spell cost to be evaluated by flagCastable 
                spellRegister.push(spellId);
                castSpell(spellId);
            }
        };
    }

    // cycles through clickSpell for each spell level
    function spellCycle(cast) {
        for (i = 0; i < 10; i++) {
            cast(`spellLevel${i + 1}`);
        }
    }

    // perform arcane recovery during a short rest
    document.getElementById("recovery").onclick = function () {
        recovery = arcaneRecovery();
        remaining = recovery;
        document.getElementById("remaining").innerHTML = remaining;
        genTable(remaining);
    };

    // perform arcane recovery during a short rest
    document.getElementById("long-rest").onclick = function () {
        genTable(getMaxPoints());
    };

    // add spell points manually
    document.getElementById("addPoints").onkeypress = function (event) {
        addedPoints = Number(this.value);
        if (event.key == "Enter" && Number.isInteger(addedPoints)) {
            remaining += addedPoints;
            document.getElementById("remaining").innerHTML = remaining;
            genTable(remaining);
        } else {
            console.warn("addPoints only takes integers!");
        }
        changeColor("remaining", (remaining <= max / 2));
        addedPoints = 0;
    };

    // set/reset spell point calculations according to caster level
    document.getElementById("casterLevel").onclick = function () {
        // reset calculations and title
        setCasterTitle();
        genTable(getMaxPoints());
    };

    // set caster school and title
    document.getElementById("casterSchool").onclick = function () {
        setCasterTitle();
    };

    spellCycle(clickSpell);

    // make functions available for testing
    return {
        flagCastable: flagCastable,
        getMaxPoints: getMaxPoints,
        arcaneRecovery: arcaneRecovery,
        castingLimit: castingLimit,
        castSpell: castSpell,
        changeColor: changeColor,
        genTable: genTable,
        getCasterType: getCasterType,
        setCasterTitle: setCasterTitle,
        spellCycle: spellCycle
    };
}());