// MUTATING BODIES — Simple OOP Version
// Biological idea: contact inhibition.
// Normal cells stop dividing when crowded. Mutated cells do not.

let tissue;
let soundOn = false;
let audioCtx;

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.style('display', 'block');
  canvas.style('max-width', '100%');
  canvas.style('height', 'auto');
  // Match the page color so no white space appears below the canvas.
  document.body.style.backgroundColor = '#151115';
  document.body.style.margin = '0';
  if (document.getElementById('sketch-holder')) canvas.parent('sketch-holder');
  frameRate(30);

  tissue = new Tissue();
  tissue.reset();

  // Mouse buttons change the environment, not individual cells.
  let up = createButton('Increase Mutation +');
  let down = createButton('Decrease Mutation -');
  let reset = createButton('Regenerate Tissue');
  let sound = createButton('Enable Sound');

  up.mousePressed(() => tissue.rate = min(0.08, tissue.rate + 0.01));
  down.mousePressed(() => tissue.rate = max(0.001, tissue.rate - 0.01));
  reset.mousePressed(() => tissue.reset());
  sound.mousePressed(() => {
    soundOn = !soundOn;
    if (soundOn && !audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (soundOn) audioCtx.resume();
    sound.html(soundOn ? 'Mute Sound' : 'Enable Sound');
  });

  for (let button of [up, down, reset, sound]) {
    if (document.getElementById('controls')) button.parent('controls');
    button.style('background', '#3c2a30');
    button.style('color', '#f1ded6');
    button.style('border', '1px solid #a66b75');
    button.style('padding', '10px');
    button.style('margin', '5px 5px 5px 0');
    button.style('cursor', 'pointer');
  }
}

function draw() {
  background(21, 17, 21);
  tissue.update();
  tissue.display();


}

// Each Cell is one object, with its own position and mutation state.
class Cell {
  constructor(x, y, mutated = false) {
    this.x = x;
    this.y = y;
    this.mutated = mutated;
    this.size = random(13, 17);
    this.shape = random(10);
  }

  // A cell detects how many other cells are nearby.
  countNeighbors(cells) {
    let count = 0;
    for (let other of cells) {
      if (other !== this && dist(this.x, this.y, other.x, other.y) < 35) count++;
    }
    return count;
  }

  update(tissue) {
    // Mutation is random. It happens without a mouse click.
    if (!this.mutated && random(1) < tissue.actualRate()) {
      this.mutated = true;
      tissue.newMutations++;
    }

    // Normal cells stop dividing when crowded.
    let crowded = this.countNeighbors(tissue.cells) >= 4;
    if ((this.mutated || !crowded) && random(1) < (this.mutated ? 0.09 : 0.01)) {
      this.divide(tissue);
    }
  }

  divide(tissue) {
    if (tissue.cells.length >= 170) return;
    let angle = random(TWO_PI);
    let x = this.x + cos(angle) * this.size * 1.6;
    let y = this.y + sin(angle) * this.size * 1.6;
    // A new cell inherits its parent's mutation state.
    tissue.cells.push(new Cell(x, y, this.mutated));
  }

  display() {
    push();
    translate(this.x, this.y);
    stroke(this.mutated ? color(202, 91, 105) : color(207, 171, 158));
    fill(this.mutated ? color(125, 48, 65) : color(152, 119, 113));
    strokeWeight(1.1);
    beginShape();
    // A slightly uneven shape looks more organic than a perfect circle.
    for (let i = 0; i < 12; i++) {
      let a = TWO_PI * i / 12;
      let r = this.size * (1 + 0.09 * sin(a * 3 + this.shape));
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
    noStroke();
    fill(this.mutated ? '#542938' : '#664b50');
    ellipse(2, -1, 10, 9);
    pop();
  }
}

// Tissue manages the group, environment, and final state.
class Tissue {
  constructor() {
    this.cells = [];
    this.rate = 0.002;
    this.state = 'growing';
    this.collapseTime = 0;
    this.newMutations = 0;
  }

  reset() {
    this.cells = [];
    this.state = 'growing';
    this.collapseTime = 0;
    // Start with one connected patch of healthy tissue.
    for (let y = -90; y <= 90; y += 28) {
      for (let x = -155; x <= 155; x += 28) {
        if (sq(x / 165) + sq(y / 100) < 1) {
          this.cells.push(new Cell(width / 2 + x, height / 2 + y));
        }
      }
    }
  }

  mutatedCount() {
    let count = 0;
    for (let cell of this.cells) if (cell.mutated) count++;
    return count;
  }

  healthyCount() {
    return this.cells.length - this.mutatedCount();
  }

  actualRate() {
    // Artistic rule: mutation becomes faster near the ending.
    let fraction = this.mutatedCount() / this.cells.length;
    return this.rate + max(0, fraction - 0.85) * 3;
  }

  update() {
    if (this.state === 'collapsed') return;
    if (this.state === 'collapsing') {
      this.collapseTime++;
      if (this.collapseTime > 100) this.state = 'collapsed';
      return;
    }

    if (frameCount % 12 === 0) {
      this.newMutations = 0;
      let originalCells = [...this.cells];
      for (let cell of originalCells) cell.update(this);
      if (this.newMutations > 0) playMutationSounds(this.newMutations);
      if (this.healthyCount() === 0) this.state = 'collapsing';
    }
    if (frameCount % 2 === 0) this.pushApart();
  }

  // When cells overlap, they push each other apart.
  pushApart() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = i + 1; j < this.cells.length; j++) {
        let a = this.cells[i], b = this.cells[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = sqrt(dx * dx + dy * dy);
        let overlap = a.size + b.size - d;
        if (d > 0 && overlap > 0) {
          let shift = overlap * 0.11;
          a.x -= dx / d * shift;
          a.y -= dy / d * shift;
          b.x += dx / d * shift;
          b.y += dy / d * shift;
        }
      }
    }
    for (let cell of this.cells) {
      cell.x = constrain(cell.x, 20, width - 20);
      cell.y = constrain(cell.y, 65, height - 45);
    }
  }

  // A soft membrane surrounds the entire tissue.
  drawMembrane() {
    let cx = 0;
    let cy = 0;
    for (let cell of this.cells) {
      cx += cell.x;
      cy += cell.y;
    }
    cx /= this.cells.length;
    cy /= this.cells.length;

    // Find the outer edge in each direction.
    let points = 48;
    let radii = [];
    for (let i = 0; i < points; i++) {
      let angle = TWO_PI * i / points;
      let r = 0;
      for (let cell of this.cells) {
        let dx = cell.x - cx;
        let dy = cell.y - cy;
        r = max(r, dx * cos(angle) + dy * sin(angle) + cell.size + 12);
      }
      radii.push(r);
    }

    // Smooth the shape so it looks like soft tissue, not a polygon.
    fill(149, 91, 97, 48);
    stroke(190, 126, 133, 130);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < points; i++) {
      let r = (radii[(i + points - 1) % points] + 2 * radii[i] + radii[(i + 1) % points]) / 4;
      let angle = TWO_PI * i / points;
      vertex(constrain(cx + cos(angle) * r, 12, width - 12),
             constrain(cy + sin(angle) * r, 12, height - 12));
    }
    endShape(CLOSE);
  }

  display() {
    // At the final state, draw ONLY the ending screen.
    // The tissue and membrane should never appear behind it.
    if (this.state === 'collapsed') {
      background(21, 17, 21);
      this.showEnding();
      return;
    }

    push();
    if (this.state !== 'growing') {
      drawingContext.globalAlpha = max(0, 1 - this.collapseTime / 100);
    }
    this.drawMembrane();
    // Neighbor connections make cells look like one living tissue.
    strokeWeight(13);
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = i + 1; j < this.cells.length; j++) {
        let a = this.cells[i], b = this.cells[j];
        if (dist(a.x, a.y, b.x, b.y) < 34) {
          stroke(a.mutated && b.mutated ? '#703341' : '#8f6e6b');
          line(a.x, a.y, b.x, b.y);
        }
      }
    }
    for (let cell of this.cells) cell.display();
    pop();

    if (this.state === 'collapsing') {
      // An opaque dark layer gradually hides the tissue as it collapses.
      noStroke();
      fill(21, 17, 21, min(255, this.collapseTime * 3));
      rect(0, 0, width, height);
      if (this.collapseTime > 40) this.showEnding();
    }

  }

  showEnding() {
    push();
    noStroke();
    fill(240, 204, 198);
    textAlign(CENTER, CENTER);
    textSize(28);
    text('TISSUE COLLAPSE', width / 2, height / 2 - 20);
    textSize(13);
    text('All cells have mutated. Click Regenerate Tissue.', width / 2, height / 2 + 18);
    pop();
  }
}

// One short electronic note for each new spontaneous mutation.
function playMutationSounds(count) {
  if (!soundOn || !audioCtx) return;
  for (let i = 0; i < count; i++) {
    let time = audioCtx.currentTime + i * 0.08;
    let oscillator = audioCtx.createOscillator();
    let volume = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 310 + i * 22;
    volume.gain.setValueAtTime(0.0001, time);
    volume.gain.exponentialRampToValueAtTime(0.025, time + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
    oscillator.connect(volume);
    volume.connect(audioCtx.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.12);
  }
}
