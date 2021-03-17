const fs = require("fs-extra"),
    path = require("path");

const video = document.querySelector("video"),
    canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    keys = {
        "d": document.querySelector("#key-d"),
        "f": document.querySelector("#key-f"),
        "j": document.querySelector("#key-j"),
        "k": document.querySelector("#key-k")
    }, 
    bars = {
        "d": document.querySelector("#bar-d"),
        "f": document.querySelector("#bar-f"),
        "j": document.querySelector("#bar-j"),
        "k": document.querySelector("#bar-k")
    },
    keyEffects = {
        "d": document.querySelector("#key-bar-d"),
        "f": document.querySelector("#key-bar-f"),
        "j": document.querySelector("#key-bar-j"),
        "k": document.querySelector("#key-bar-k")
    },
    keydown = {},
    game = {
        "notes": [],
        "speed": 1,
        "tick": 10,
        "score": 0,
        "combo": 0,
        "currentTime": 0,
        "maxCombo": 0
    };

let loop = null,
    songs = [],
    notes = [];

document.addEventListener("keydown", function(event) {
    if(event.key.toLowerCase() === "escape") {
        event.preventDefault();
        Escape();
        return;
    }

    if(["enter", " ", "tab"].includes(event.key.toLowerCase())) event.preventDefault();

    keydown[event.key] = true;
    Update();
    NormalNote(event.key.toLowerCase());
});

document.addEventListener("keyup", function(event) {
    delete keydown[event.key];
    Update();
});

function Update() {
    ["d", "f", "j", "k"].forEach(e => {
        if(keydown[e]) {
            keys[e].style.background = "rgba(125, 205, 255, 0.5)";
            keyEffects[e].style.background = "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))";
            bars[e].style.background = "rgba(125, 205, 255, 0.5)";
        } else {
            keys[e].style.background = "none";
            keyEffects[e].style.background = "rgba(255, 255, 255, 0)";
            bars[e].style.background = "none";
        }
    });
}

/**
 * @function Escape to select menu 
 */
function Escape() {
    if(document.querySelector(".song-select").style.display === "flex") return;
    video.pause();
    if(loop !== null) {
        clearInterval(loop);
        loop = null;
    }
    document.querySelector(".song-select").style.display = "flex";
}

function NormalNote(key) {
    //128~132 = fast
    //133~135~137 = perfect
    //138~142 = late

    game.notes.forEach((e, i) => {
        if(e.key !== key) return;
        if(e.type === "long") {
            if(e.y + e.duration < 137 || e.y + e.duration > 145) return;
            if(e.y + e.duration <= 135) {
                document.querySelector(".ui-effect").innerHTML = "fast";
                game.score += 10;
                game.combo++;
                return;
            }
            if(e.y + e.duration <= 140) {
                document.querySelector(".ui-effect").innerHTML = "perfect";
                game.score += 20;
                game.combo++;
                return;
            }
            if(e.y + e.duration <= 145) {
                document.querySelector(".ui-effect").innerHTML = "late";
                game.score += 5;
                game.combo++;
                return;
            }
            return;
        }
        if(e.y < 127 || e.y > 145) return;
        if(e.y <= 132) {
            document.querySelector(".ui-effect").innerHTML = "fast";
            game.score += 10;
            game.combo++;
            game.notes.splice(i, 1);
            return;
        }
        if(e.y <= 139) {
            document.querySelector(".ui-effect").innerHTML = "perfect";
            game.score += 20;
            game.combo++;
            game.notes.splice(i, 1);
            return;
        }
        if(e.y <= 145) {
            document.querySelector(".ui-effect").innerHTML = "late";
            game.score += 5;
            game.combo++;
            game.notes.splice(i, 1);
            return;
        }
    });
}

function GameUpdate() {
    game.currentTime++;
    let currentTime = game.currentTime;

    if(notes[currentTime + 135]) {
        notes[currentTime + 135].forEach(e => {
            if(e.type === "long") {
                game.notes.push(new LongNote(e.key, e.type, e.end - currentTime - 135));
            }
            else game.notes.push(new Note(e.key, e.type));
        });
    }

    ctx.clearRect(0, 0, 370, 640);
    game.notes.forEach((e, i) => {
        e.drop(game.speed);
        if(e.type === "long") {
            if(e.duration <= 1) {
                game.notes.splice(i, 1);
                return;
            }
            if(e.y + e.duration > 150) {
                document.querySelector(".ui-effect").innerHTML = "loss";
                game.combo = 0;
                game.notes.splice(i, 1);
            }
        }
        if(e.y > 145) {
            document.querySelector(".ui-effect").innerHTML = "loss";
            game.combo = 0;
            game.notes.splice(i, 1);
        }
        else e.draw();
    });

    document.querySelector(".ui-score").innerHTML = `Score: ${game.score}`;
    document.querySelector(".ui-combo").innerHTML = game.combo;
    if(game.maxCombo < game.combo) {
        game.maxCombo = game.combo;
        document.querySelector(".ui-maxCombo").innerHTML = `Max: ${game.maxCombo}`;
    }
}

/**
 * @constructor Note
 * 
 * @param {string} key 
 * @param {string} type 
 */
function Note(key, type) {
    this.key = key;
    this.x = ["d", "f", "j", "k"].indexOf(key) * 75;
    this.y = 0;
    this.type = type;
}

Note.prototype.drop = function(dy) {
    this.y += dy;
    console.log(this.y);
};

Note.prototype.draw = function() {
    ctx.fillRect(this.x, this.y, 75, 4);
};

/**
 * @constructor long note
 * @param {string} key
 * @param {string} type
 * @param {string} duration
 */
function LongNote(key, type, duration) {
    this.key = key;
    this.x = ["d", "f", "j", "k"].indexOf(key) * 75;
    this.y = -duration;
    this.type = type;
    this.duration = duration;
}

LongNote.prototype.drop = function(dy) {
    this.y += dy;
    if(this.y < 140 && this.y + this.duration >= 127) {    
        if(keydown[this.key]) {
            document.querySelector(".ui-effect").innerHTML = "perfect";
            game.score += 20;
            this.duration = 140 - this.y;
        }
    }
}

LongNote.prototype.draw = function() {
    ctx.fillStyle = "blueviolet";
    ctx.fillRect(this.x, this.y, 75, this.duration);
    ctx.fillStyle = "white";
}

/**
 * @function Initializing before the game starts
 */
function Init() {
    console.log("init");
    game.notes = [];
    game.score = 0;
    game.combo = 0;
    game.currentTime = 0;

    document.querySelector(".ui-score").innerHTML = `Score: 0`;
    document.querySelector(".ui-combo").innerHTML = 0;
    document.querySelector(".ui-maxCombo").innerHTML = `Max: 0`;
    document.querySelector(".ui-effect").innerHTML = "";

    if(loop !== null) {
        clearInterval(loop);
        loop = null;
    }

    loop = setInterval(function() {
        GameUpdate();
    }, game.tick);
    video.play();
    game.currentTime = (video.currentTime * 100) | 0;
}

/**
 * @function listener for music selection
 * @param {string} song 
 */
function Start(song) {
    video.src = "../songs/" + song + ".mp4";
    notes = JSON.parse(fs.readFileSync(path.join(__dirname, `../songs/${song}.json`)));
    document.querySelector(".song-select").style.display = "none";
}

(function AppStart() {
    video.volume = 0.5;
    let versionData = JSON.parse(fs.readFileSync(path.join(__dirname, "version.json")));
    songs = Object.keys(versionData.songs);

    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.6;

    video.addEventListener("canplay", function(event) {
        Init();
    });

    songs.forEach(e => document.querySelector(".songs-list").innerHTML += `<div class="song" onclick="Start('${e}')">${versionData.songs[e]}</div>`);
})();