let bigImage = document.getElementById("bigImage");
let pauseButton = document.getElementById("pauseButton");
let playButton = document.getElementById("playButton");

let thumb2 = document.getElementById("thumb2");
let thumb1 = document.getElementById("thumb1");
let thumb3 = document.getElementById("thumb3");
let thumb4 = document.getElementById("thumb4");

    thumb2.addEventListener("click", () =>{
        bigImage.src = thumb2.src;
    });
    thumb1.addEventListener("click", () =>{
        bigImage.src = thumb1.src;
    });
    thumb3.addEventListener("click",()=>{
        bigImage.src = thumb3.src;
    });
    thumb4.addEventListener("click", () =>{
        bigImage.src = thumb4.src;
    });

let timer = setInterval(() => {

    if (bigImage.src === thumb1.src) {
        bigImage.src = thumb2.src;
    }
    else if (bigImage.src === thumb2.src) {
        bigImage.src = thumb3.src;
    }
    else if (bigImage.src === thumb3.src) {
        bigImage.src = thumb4.src;
    }
   else {
        bigImage.src = thumb1.src;
   }



}, 3000); // Change image every 3 seconds

pauseButton.addEventListener("click", () => {
    clearInterval(timer);
});