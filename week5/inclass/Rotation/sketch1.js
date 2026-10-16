function setup() {
    createCanvas(800, 600, document.getElementById('sk1'));
    angle = 0;
}

function draw() {
    background(220);
    makeGrid()

   

    //transform
    push()
    translate(100+100, 70+75)
    rotate(angle)
    makeGrid()
     //draw rect;
    fill(200,160,20)
    rect(-100, -75, 200, 150)
    makeGrid()
    pop()
    angle += 0.01;
    
}

function makeGrid(gridRes = 10) {
    let xVal = width/gridRes
    for(let x = 0; x < gridRes; x++) {
        line(xVal * x, 0, xVal * x, height);
        
    }

    let yVal = height/gridRes
    for(let y = 0; y < gridRes; y++) {
        line(0, yVal * y, width, yVal * y);
    }

}
