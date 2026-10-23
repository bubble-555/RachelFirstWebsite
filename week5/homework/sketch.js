function setup() {
  createCanvas(800, 600);
}

function draw() {
  background("#f2efe7");

  // Draw the orbital path
  noFill();
  stroke(40, 40, 45, 45);
  strokeWeight(1);
  circle(400, 300, 380);

  // Calculate two independent movements
  let angle = frameCount * 0.012;
  let x = 400 + cos(angle) * 190;
  let y = 300 + sin(angle) * 190;

  let orangeY = 300 + sin(frameCount * 0.023 + 1.2) * 95;

  // Draw the oscillating body
  layeredBody(400, orangeY, 70, 100, "#e65a38");

  // Draw the orbiting body
  layeredBody(x, y, 48, 0, "#7974c9");

  
}

// Draw a colored body with nested contour lines
function layeredBody(x, y, radius, offset, bodyColor) {
  push();
  translate(x, y);

  // Draw the outer silhouette
  fill(bodyColor);
  noStroke();
  organicOutline(radius, offset);

  // Draw nested outlines using the same noise pattern
  noFill();
  stroke("#f2efe7");
  strokeWeight(0.8);

  for (let size = 0.85; size > 0.15; size -= 0.14) {
    organicOutline(radius * size, offset);
  }

  pop();
}

// Build a continuous organic outline
function organicOutline(radius, offset) {
  beginShape();

  for (let i = 0; i < 180; i++) {
    let a = TWO_PI * i / 180;

    let n = noise(
      cos(a) * 0.8 + 5 + offset,
      sin(a) * 0.8 + 5,
      frameCount * 0.006
    );

    let r = radius * map(n, 0, 1, 0.7, 1.3);

    vertex(cos(a) * r, sin(a) * r);
  }

  endShape(CLOSE);
}