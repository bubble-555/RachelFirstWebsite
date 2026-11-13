// DON'T TOUCH ME! — first prototype
// Uses ml5 HandPose to control a playful creature without a mouse.

let video;
let handPose;
let hands = [];
let gesture = "No Hand";
let rawGesture = "No Hand";
let sameGestureFrames = 0;
let palmX = 380;
let palmY = 250;

let creatureX = 380;
let creatureY = 265;
let creatureAlpha = 255;
let mode = "WANDER";
let modeStart = 0;
let escapeDirection = 1;
let creatureSize = 52;

// p5.js 1.x loads ml5 HandPose in preload().
// This fixes the first-test problem where the screen stayed at NO HAND.
function preload() {
  handPose = ml5.handPose();
}

function setup() {
  let canvas = createCanvas(760, 500);
  canvas.parent("game");

  // Keep the camera at a standard 4:3 resolution.
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  creatureX = width / 2;
  creatureY = height * 0.53;

  document.getElementById("status").textContent = "HandPose running";
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(255);
  drawGuideLines();
  updateGesture();
  updateCreature();
  drawCreature();
  drawWebcamPreview();
  drawLabels();
}

function updateGesture() {
  let detected = "No Hand";

  if (hands.length > 0 && hands[0].keypoints) {
    let k = hands[0].keypoints;
    let wrist = k[0];
    // Average palm landmarks to locate the hand.
    let anchors = [0, 5, 9, 13, 17];
    let x = 0;
    let y = 0;
    for (let i of anchors) {
      x += k[i].x;
      y += k[i].y;
    }
    // Mirror X and scale camera coordinates to the larger game canvas.
    palmX = width - (x / anchors.length) * (width / video.width);
    palmY = (y / anchors.length) * (height / video.height);

    // Compare fingertips with middle finger joints relative to the wrist.
    // An extended finger's tip is farther from the wrist than its PIP joint.
    let tips = [8, 12, 16, 20];
    let joints = [6, 10, 14, 18];
    let extended = 0;
    for (let i = 0; i < 4; i++) {
      let tipDistance = dist(k[tips[i]].x, k[tips[i]].y, wrist.x, wrist.y);
      let jointDistance = dist(k[joints[i]].x, k[joints[i]].y, wrist.x, wrist.y);
      if (tipDistance > jointDistance * 1.13) extended++;
    }

    if (extended >= 3) detected = "Open Hand";
    else if (extended <= 1) detected = "Fist";
    else detected = "Unclear";
  }

  // Simple smoothing stops jitter from changing the interaction too quickly.
  if (detected === rawGesture) sameGestureFrames++;
  else {
    rawGesture = detected;
    sameGestureFrames = 0;
  }
  if (sameGestureFrames > 4) gesture = detected;
}

function updateCreature() {
  // The fist triggers one complete escape sequence.
  if (gesture === "Fist" &&
      mode !== "STARTLED" && mode !== "ESCAPE" && mode !== "HIDDEN") {
    mode = "STARTLED";
    modeStart = millis();
    escapeDirection = palmX <= creatureX ? 1 : -1;
  }

  if (mode === "STARTLED") {
    // Freeze and tremble before running away.
    creatureX += random(-2.5, 2.5);
    creatureY += random(-2.5, 2.5);
    if (millis() - modeStart > 350) {
      mode = "ESCAPE";
      modeStart = millis();
    }
  } else if (mode === "ESCAPE") {
    let elapsed = millis() - modeStart;
    let speed = min(25, 9 + elapsed / 65);
    creatureX += escapeDirection * speed;
    creatureY += sin(frameCount * 0.55) * 2;
    if (creatureX < -70 || creatureX > width + 70) {
      mode = "HIDDEN";
      modeStart = millis();
    }
  } else if (mode === "HIDDEN") {
    // Stay out of sight until the fist is released.
    if (millis() - modeStart > 850 && gesture !== "Fist") {
      creatureX = escapeDirection > 0 ? -45 : width + 45;
      creatureY = height * 0.56;
      creatureAlpha = 0;
      mode = "RETURN";
    }
  } else {
    creatureAlpha = lerp(creatureAlpha, 255, 0.035);
    let goalX;
    let goalY;

    if (gesture === "Open Hand") {
      mode = "APPROACH";
      // Come close to the open palm, but leave a little personal space.
      goalX = constrain(palmX + 75, 45, width - 45);
      goalY = constrain(palmY - 18, 55, height - 45);
    } else {
      mode = "WANDER";
      goalX = width * 0.5 + sin(frameCount * 0.017) * 110;
      goalY = height * 0.52 + cos(frameCount * 0.021) * 60;
    }

    creatureX = lerp(creatureX, goalX, 0.035);
    creatureY = lerp(creatureY, goalY, 0.035);
  }
}

function drawGuideLines() {
  stroke(238);
  strokeWeight(1);
  for (let x = 40; x < width; x += 40) line(x, 0, x, height);
  for (let y = 40; y < height; y += 40) line(0, y, width, y);

  if (hands.length > 0) {
    noFill();
    stroke(240, 80, 58, 135);
    strokeWeight(1.5);
    circle(palmX, palmY, 46);
    circle(palmX, palmY, 7);
  }
}

function drawCreature() {
  if (mode === "HIDDEN") return;

  push();
  translate(creatureX, creatureY);
  let wobble = mode === "ESCAPE" ? 0.8 : 1 + sin(frameCount * 0.1) * 0.045;
  scale(wobble, 1 / wobble);
  noStroke();
  fill(15, 15, 15, creatureAlpha);
  ellipse(0, 0, creatureSize, creatureSize);

  // Two tiny eyes make the black dot feel alive.
  fill(255, creatureAlpha);
  if (mode === "STARTLED" || mode === "ESCAPE") {
    ellipse(-9, -5, 7, 11);
    ellipse(9, -5, 7, 11);
    ellipse(0, 10, 7, 9);
  } else {
    circle(-9, -4, 5);
    circle(9, -4, 5);
  }
  pop();
}

function drawWebcamPreview() {
  if (!video) return;
  let w = 148;
  let h = 96;
  let x = width - w - 20;
  let y = 24;
  push();
  stroke(30);
  strokeWeight(1);
  fill(250);
  rect(x - 4, y - 4, w + 8, h + 8);
  // Mirror the preview so it matches the tracked palm position.
  translate(x + w, y);
  scale(-1, 1);
  image(video, 0, 0, w, h);
  pop();
}

function drawLabels() {
  noStroke();
  fill(25);
  textFont("Arial");
  textSize(13);
  text("GESTURE: " + gesture.toUpperCase(), 20, 31);
  textSize(11);
  fill(115);
  text("BEHAVIOR: " + mode, 20, 51);
  text("CAMERA", width - 165, 140);
  text("Open palm = come closer   /   Fist = run away", 20, height - 20);
}
