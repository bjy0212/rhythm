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

/**
 * @function Drop
 *  
 * @param {number} dy - pixel to drop
 */
 Note.prototype.drop = function(dy) {
    this.y += dy;
};

/**
 * @function Context drawing
 */
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
