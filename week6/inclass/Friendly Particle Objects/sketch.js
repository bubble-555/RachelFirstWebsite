let particles = []

function setup() {
    createCanvas(800, 600);

    particles.push(new Particle(width*0.5, height*0.5))
}

function draw() {
    background(220);

    particles.forEach ((p)=>{
        p.move()
        p.display()
        p.reachOut(particles)
    })


}

function mouseReleased(event){
    particles.push(new Particle(mouseX, mouseY))
}