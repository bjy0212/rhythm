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

/**
 * @function GameOver
 */
 function GameOver() {
    console.log("game over");
}