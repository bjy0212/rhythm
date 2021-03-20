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
        "maxCombo": 0,
        "hp": 300
    },
    hpbar = document.querySelector(".ui-hp-bar");

let loop = null,
    songs = [],
    notes = [];

window.addEventListener("keydown", function(event) {
    if(event.key.toLowerCase() === "escape") {
        event.preventDefault();
        Escape();
        return;
    }

    if(["enter", " ", "tab"].includes(event.key.toLowerCase())) event.preventDefault();

    if(keydown[event.key]) return;

    keydown[event.key] = true;
    Update();
    NormalNote(event.key.toLowerCase());
});

window.addEventListener("keyup", function(event) {
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

function NormalNote(key) {
    game.notes.forEach((e, i) => {
        if(e.key !== key) return;
        if(e.type === "long") {
            if(e.y + e.duration < 131 || e.y + e.duration > 150) return;
            if(e.y + e.duration <= 138) {
                document.querySelector(".ui-effect").innerHTML = "fast";
                game.score += 10;
                game.combo++;
                return;
            } else if(e.y + e.duration <= 141) {
                document.querySelector(".ui-effect").innerHTML = "perfect";
                game.score += 20;
                if(game.hp < 300) game.hp += 50;
                if(game.hp > 300) game.hp = 300;
                game.combo++;
                return;
            } else if(e.y + e.duration <= 150) {
                document.querySelector(".ui-effect").innerHTML = "late";
                game.score += 5;
                game.combo++;
            }
            
            document.querySelector(".ui-score").innerHTML = `Score: ${game.score}`;
            document.querySelector(".ui-combo").innerHTML = game.combo;
            if(game.maxCombo < game.combo) {
                game.maxCombo = game.combo;
                document.querySelector(".ui-maxCombo").innerHTML = `Max: ${game.maxCombo}`;
            }
            hpbar.style.width = game.hp + "px";
            if(game.hp > 150) hpbar.style.background = "rgba(255, 255, 255, 0.8)";
            else if(game.hp > 75) hpbar.style.background = "rgba(255, 166, 0, 0.8)";
            else hpbar.style.background = "rgba(255, 0, 0, 0.8)";
            hpbar.innerHTML = game.hp;
            return;
        }
        if(e.y < 129 || e.y > 146) return;
        if(e.y <= 135) {
            document.querySelector(".ui-effect").innerHTML = "fast";
            game.score += 10;
            game.combo++;
            game.notes.splice(i, 1);
        } else if(e.y <= 139) {
            document.querySelector(".ui-effect").innerHTML = "perfect";
            game.score += 20;
            if(game.hp < 300) game.hp += 50;
            if(game.hp > 300) game.hp = 300;
            game.combo++;
            game.notes.splice(i, 1);
        } else if(e.y <= 146) {
            document.querySelector(".ui-effect").innerHTML = "late";
            game.score += 5;
            game.combo++;
            game.notes.splice(i, 1);
        }
    });

    document.querySelector(".ui-score").innerHTML = `Score: ${game.score}`;
    document.querySelector(".ui-combo").innerHTML = game.combo;
    if(game.maxCombo < game.combo) {
        game.maxCombo = game.combo;
        document.querySelector(".ui-maxCombo").innerHTML = `Max: ${game.maxCombo}`;
    }
    hpbar.style.width = game.hp + "px";
    if(game.hp > 150) hpbar.style.background = "rgba(255, 255, 255, 0.8)";
    else if(game.hp > 75) hpbar.style.background = "rgba(255, 166, 0, 0.8)";
    else hpbar.style.background = "rgba(255, 0, 0, 0.8)";
    hpbar.innerHTML = game.hp;
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
                game.hp -= 30;
                if(game.hp < 0) GameOver();
                game.notes.splice(i, 1);
            }
        }
        if(e.y > 145) {
            document.querySelector(".ui-effect").innerHTML = "loss";
            game.combo = 0;
            game.hp -= 10;
            if(game.hp < 0) GameOver();
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
    hpbar.style.width = game.hp + "px";
    if(game.hp > 150) hpbar.style.background = "rgba(255, 255, 255, 0.8)";
    else if(game.hp > 75) hpbar.style.background = "rgba(255, 166, 0, 0.8)";
    else hpbar.style.background = "rgba(255, 0, 0, 0.8)";
    hpbar.innerHTML = game.hp;
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
    if(keydown[this.key]) {
        if(this.y + this.duration < 131 || this.y + this.duration > 150) {
            return
        } else if(this.y + this.duration <= 138) {
            document.querySelector(".ui-effect").innerHTML = "fast";
            game.score += 10;
            game.combo++;
        } else if(this.y + this.duration <= 141) {
            document.querySelector(".ui-effect").innerHTML = "perfect";
            game.score += 20;
            if(game.hp < 300) game.hp += 50;
            if(game.hp > 300) game.hp = 300;
            game.combo++;
        } else if(this.y + this.duration <= 150) {
            if (this.y >= 140) this.duration = 0;
            document.querySelector(".ui-effect").innerHTML = "late";
            game.score += 5;
            game.combo++;
        }

        this.duration -= 1;

        if(game.maxCombo < game.combo) {
            game.maxCombo = game.combo;
            document.querySelector(".ui-maxCombo").innerHTML = `Max: ${game.maxCombo}`;
        }
        hpbar.style.width = game.hp + "px";
        if(game.hp > 150) hpbar.style.background = "rgba(255, 255, 255, 0.8)";
        else if(game.hp > 75) hpbar.style.background = "rgba(255, 166, 0, 0.8)";
        else hpbar.style.background = "rgba(255, 0, 0, 0.8)";
        hpbar.innerHTML = game.hp;
    }
}

LongNote.prototype.draw = function() {
    ctx.fillStyle = "gold";
    ctx.fillRect(this.x, this.y, 75, this.duration);
    ctx.fillStyle = "white";
}

/**
 * @function Initializing before the game starts
 */
function Init() {
    video.play();
    game.notes = [];
    game.score = 0;
    game.combo = 0;
    game.currentTime = 0;
    hpbar.style.width = "300px";
    game.hp = 300;

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

/**
 * @function GameOver
 */
 function GameOver() {

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
    hpbar.style.width = "0px";
    document.querySelector(".song-select").style.display = "flex";
}

(function AppStart() {
    video.volume = 0.5;
    let versionData = JSON.parse(fs.readFileSync(path.join(__dirname, "version.json")));
    songs = Object.keys(versionData.songs);

    canvas.width = 300;
    canvas.height = 150;

    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.6;

    video.addEventListener("canplay", function(event) {
        Init();
    });

    songs.forEach(e => document.querySelector(".songs-list").innerHTML += `<div class="song" onclick="Start('${e}')">${versionData.songs[e]}</div>`);
})();