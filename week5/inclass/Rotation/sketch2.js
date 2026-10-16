const numCircles = 10;
let radius;
let strWeight = 20;
let aWidth;
let aHeight;


function setup() {
    createCanvas(800, 800, document.getElementById('sk2'));

    colorMode(HSB, TWO_PI, 1, 1, 1);
    radius = width*0.1
  
}

function draw() {
    background("black");
    noFill();
    
    for(let i = 0; i < numCircles; i++) {
        stroke( TWO_PI/ numCircles * i, 0.8, 0.8 );
        strokeWeight(strWeight);
        aWidth = radius*2 + (strWeight* i* 2);
        aHeight = aWidth;

        push();
        translate(width*0.5, height*0.5);
        rotate(sin(millis()*0.001 * (i*0.5 +1)));
        arc(0, 0, aWidth, aHeight, 3/4 * PI, 1/4 * PI);

        pop();
    }
}