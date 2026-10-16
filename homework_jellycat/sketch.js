let jellyfish;
let oceanSound;

let xoff = 0;
let yoff = 100;
let bubbles = [];

async function setup() {
  createCanvas(800, 600);
  imageMode(CENTER);
  noStroke();

  // Load jellyfish image
  jellyfish = await loadImage("jellyfish.png");

  // Create bubbles
  for (let i = 0; i < 15; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(5, 15),
      speed: random(0.5, 2)
    });
  }

  // Load ocean sound
  try {
    oceanSound = await loadSound("ocean_ambient_jellyfish.wav");
    console.log("Sound loaded successfully!");
  } catch (error) {
    console.error("Sound loading failed:", error);
  }
}

function draw() {
  // dark ocean background with transparency for trail effect
  background(5, 15, 35, 50);
fill(170, 210, 255, 90);

for (let i = 0; i < bubbles.length; i++) {
  let b = bubbles[i];

  let swayX = sin(frameCount * 0.025 + i) * 8;

  circle(b.x + swayX, b.y, b.size);

  b.y = b.y - b.speed;

  if (b.y < 0) {
    b.y = height;
    b.x = random(width);
  }
}
  // smooth drifting movement
  let x = noise(xoff) * width;
  let y = noise(yoff) * height;

  // pulsing movement
  let pulse = sin(frameCount * 0.08);

  // jellyfish size
  let scaleSize = 150 + pulse * 10;

  // slight up and down floating
  let floatY = pulse * 6;

  // gentle side-to-side sway
  let sway = sin(frameCount * 0.03) * 0.12;

  // small extra horizontal drift
  let driftX = sin(frameCount * 0.02) * 8;

  // soft glow behind the jellyfish
  fill(120, 180, 255, 20);
  ellipse(x, y + floatY, scaleSize * 0.9, scaleSize * 0.9);

  // draw jellyfish
  push();
  translate(x + driftX, y + floatY);
  rotate(sway);
  image(jellyfish, 0, 0, scaleSize, scaleSize);
  pop();

  // move through noise space slowly
  xoff = xoff + 0.0035;
  yoff = yoff + 0.004;
}

function mousePressed() {
  console.log("Canvas clicked!");

  if (oceanSound && !oceanSound.isPlaying()) {
    oceanSound.loop(true);
    oceanSound.play();

    console.log("Sound started!");
  }
}