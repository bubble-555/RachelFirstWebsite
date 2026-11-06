// MUTATING BODIES — Version 4: Final-stage pressure + mutation-linked sound
// A simplified contact-inhibition simulation.
// Each cell senses its neighbors. The tissue has no pre-planned final shape.

let tissue;
let increaseButton;
let decreaseButton;
let regenerateButton;
let soundButton;
let audioContext = null;
let soundEnabled = false;
let audioMasterGain = null;
let nextMutationToneTime = 0;
let lastBeatFrame = -1000;
let statusLabel;
let effectiveLabel;
let eventsLabel;
let burstLabel;
let mutationLabel;
let countLabel;
let environmentLabel;
let progressBar;

function setup() {
  let canvas = createCanvas(860, 520);
  canvas.style('display', 'block');
  canvas.style('max-width', '100%');
  canvas.style('height', 'auto');
  document.body.style.background = '#111014';
  document.body.style.margin = '0';
  frameRate(30);
  pixelDensity(1);

  // Parent elements exist on the website, but not in the p5.js Editor.
  if (document.getElementById('sketch-holder')) {
    canvas.parent('sketch-holder');
  }

  tissue = new Tissue();
  tissue.regenerate();

  increaseButton = createButton('Increase Mutation +');
  decreaseButton = createButton('Decrease Mutation -');
  regenerateButton = createButton('Regenerate Tissue');
  soundButton = createButton('Enable Sound');
  regenerateButton.addClass('regenerate-toggle');
  soundButton.addClass('sound-toggle');

  // Buttons also look intentional inside a plain p5.js Editor embed.
  for (let button of [increaseButton, decreaseButton, regenerateButton, soundButton]) {
    button.style('cursor', 'pointer');
    button.style('background', '#38262c');
    button.style('color', '#edd9d0');
    button.style('border', '1px solid #80565d');
    button.style('padding', '10px 14px');
    button.style('margin', '5px 6px 5px 0');
    button.style('font-family', 'monospace');
  }

  if (document.getElementById('controls')) {
    increaseButton.parent('controls');
    decreaseButton.parent('controls');
    regenerateButton.parent('controls');
    soundButton.parent('controls');
  }

  increaseButton.mousePressed(function () {
    tissue.changeMutation(1);
    playControlSound(true);
  });

  decreaseButton.mousePressed(function () {
    tissue.changeMutation(-1);
    playControlSound(false);
  });

  regenerateButton.mousePressed(function () {
    tissue.regenerate();
    playRegenerationSound();
  });

  // Browsers only allow sound after a direct user action.
  // We synthesize sound, so no audio files or extra p5.sound library are needed.
  soundButton.mousePressed(toggleSound);

  mutationLabel = select('#mutation-value');
  countLabel = select('#cell-count');
  environmentLabel = select('#environment-value');
  progressBar = select('#pressure-fill');
  statusLabel = select('#system-state');
  effectiveLabel = select('#effective-value');
  eventsLabel = select('#event-count');
  burstLabel = select('#burst-count');
}

function draw() {
  background(17, 15, 18);

  // Draw subtle background lines, like a laboratory viewing field.
  stroke(165, 126, 115, 18);
  strokeWeight(1);
  for (let y = 40; y < height; y += 60) {
    line(28, y, width - 28, y);
  }

  tissue.update();
  tissue.display();
  tissue.displayEnding();
  drawInformation();

  // The pulse becomes faster as the mutated share of the tissue increases.
  // This makes the overall sound reflect the MUTATED POPULATION, not just random events.
  let fraction = tissue.mutatedFraction();
  let beatInterval = round(95 - fraction * 65); // 3.2s at 0% -> 1.0s at 100% (30fps)
  if (soundEnabled && tissue.status === 'growing' && frameCount - lastBeatFrame >= beatInterval) {
    playHeartbeat(fraction);
    lastBeatFrame = frameCount;
  }

  // These additional labels exist only on the project website.
  if (mutationLabel) mutationLabel.html(tissue.mutationRate.toFixed(4));
  if (countLabel) countLabel.html(tissue.countHealthy() + ' healthy / ' + tissue.countMutated() + ' mutated');
  if (environmentLabel) environmentLabel.html(tissue.environmentName());
  if (progressBar) progressBar.style('width', (tissue.mutationRate / 0.074 * 100) + '%');
  if (statusLabel) statusLabel.html(tissue.statusText());
  if (effectiveLabel) effectiveLabel.html(tissue.effectiveMutationChance().toFixed(4));
  if (eventsLabel) eventsLabel.html(String(tissue.mutationEvents));
  if (burstLabel) burstLabel.html(tissue.burstDisplayFrames > 0 ? ('+' + tissue.lastBurst) : '—');
}

function drawInformation() {
  noStroke();
  textFont('monospace');
  textSize(11);
  textAlign(LEFT);
  fill(197, 173, 163, 190);
  text('TISSUE EXPERIMENT / CONTACT INHIBITION', 38, 31);
  textSize(10);
  fill(190, 151, 145, 180);
  let burstText = tissue.burstDisplayFrames > 0 ? '+' + tissue.lastBurst : '—';
  text('BASE ' + tissue.mutationRate.toFixed(3) + '  /  ACTUAL ' +
       tissue.effectiveMutationChance().toFixed(3) + '  /  EVENTS ' +
       tissue.mutationEvents + '  /  LAST ' + burstText, 38, 48);
  text('ENVIRONMENT: ' + tissue.environmentName() + '     /     ' + tissue.statusText(), 38, height - 25);

  fill(184, 151, 137, 95);
  textAlign(RIGHT);
  text('HEALTHY: ' + tissue.countHealthy() + '   MUTATED: ' + tissue.countMutated(), width - 36, height - 25);

  // The pressure indicator changes immediately when the user clicks a button.
  noStroke();
  fill(93, 60, 65, 160);
  rect(width - 185, 24, 146, 5, 4);
  fill(184, 91, 98);
  rect(width - 185, 24, 146 * tissue.mutationRate / 0.074, 5, 4);
}

// -----------------------------------------------------
// CELL — one independent object with local growth rules.
// -----------------------------------------------------
class Cell {
  constructor(x, y, mutated) {
    this.x = x;
    this.y = y;
    this.mutated = mutated;
    this.radius = random(14, 18);
    this.phase = random(TWO_PI);
    this.seed = random(100);
    this.birthGlow = 1;
  }

  countNeighbors(cells) {
    let neighbors = 0;
    for (let other of cells) {
      if (other !== this && dist(this.x, this.y, other.x, other.y) < 37) {
        neighbors++;
      }
    }
    return neighbors;
  }

  update(tissue) {
    // Mutation happens by chance; the viewer never selects an individual cell.
    if (!this.mutated && random(1) < tissue.currentChance) {
      this.mutated = true;
      tissue.newMutation(this.x, this.y);
    }

    let neighbors = this.countNeighbors(tissue.cells);

    // Normal cells stop dividing when crowded (contact inhibition).
    // Mutated cells can keep dividing in crowded areas.
    let allowedToDivide = this.mutated || neighbors < 4;
    let divisionChance = this.mutated ? 0.085 : 0.009;

    if (allowedToDivide && random(1) < divisionChance) {
      this.divide(tissue);
    }
  }

  divide(tissue) {
    if (tissue.cells.length >= tissue.maxCells) return;

    let angle = random(TWO_PI);
    let distance = this.radius * 1.12;
    let childX = this.x + cos(angle) * distance;
    let childY = this.y + sin(angle) * distance;

    // Daughter cells inherit the mutation state.
    let child = new Cell(childX, childY, this.mutated);
    tissue.cells.push(child);
    this.birthGlow = 1;
  }

  display() {
    push();
    translate(this.x, this.y);

    let pulse = sin(frameCount * 0.035 + this.phase) * 0.6;
    let r = this.radius + pulse;

    // The organic membrane is intentionally irregular, unlike a rigid circle.
    let wobble = this.mutated ? 0.19 : 0.075;
    strokeWeight(this.mutated ? 1.2 : 0.9);
    if (this.mutated) {
      stroke(211, 101, 105, 160);
      fill(110, 48, 59, 225);
    } else {
      stroke(220, 182, 164, 145);
      fill(147, 116, 110, 215);
    }

    beginShape();
    for (let i = 0; i <= 14; i++) {
      let a = i / 14 * TWO_PI;
      let irregular = 1 + wobble * sin(a * 3 + this.seed)
                        + wobble * 0.36 * cos(a * 5 + this.phase);
      vertex(cos(a) * r * irregular, sin(a) * r * irregular);
    }
    endShape(CLOSE);

    // A pale nucleus is displaced slightly inside each cell.
    noStroke();
    if (this.mutated) {
      fill(227, 128, 126, 120);
      ellipse(-r * 0.15, r * 0.1, r * 0.88, r * 0.70);
      fill(57, 24, 39, 165);
      ellipse(r * 0.1, 0, r * 0.48, r * 0.55);
    } else {
      fill(218, 187, 165, 115);
      ellipse(-r * 0.12, r * 0.09, r * 0.86, r * 0.73);
      fill(76, 51, 55, 135);
      ellipse(r * 0.09, 0, r * 0.42, r * 0.5);
    }

    // Young daughter cells are briefly brighter, making division visible.
    if (this.birthGlow > 0) {
      noFill();
      stroke(242, 196, 158, this.birthGlow * 95);
      strokeWeight(2);
      ellipse(0, 0, r * 2.05, r * 2.05);
      this.birthGlow = max(0, this.birthGlow - 0.035);
    }
    pop();
  }
}

// -----------------------------------------------------
// TISSUE — manages the cell population and environment.
// -----------------------------------------------------
class Tissue {
  constructor() {
    this.cells = [];
    this.mutationRate = 0.002;
    this.maxCells = 270;
    this.flashes = [];
    this.environmentPulse = 0;
    this.mutationEvents = 0;
    this.mutationsThisStep = 0;
    this.lastBurst = 0;
    this.burstDisplayFrames = 0;
    this.currentChance = this.mutationRate;
    this.status = 'growing';
    this.collapseFrames = 0;
    this.startFrame = 0;
    this.finalStats = null;
  }

  regenerate() {
    this.cells = [];
    this.flashes = [];
    this.mutationEvents = 0;
    this.mutationsThisStep = 0;
    this.lastBurst = 0;
    this.burstDisplayFrames = 0;
    this.currentChance = this.mutationRate;
    nextMutationToneTime = audioContext ? audioContext.currentTime : 0;
    this.environmentPulse = 15;
    this.status = 'growing';
    this.collapseFrames = 0;
    this.startFrame = frameCount;
    this.finalStats = null;
    lastBeatFrame = frameCount;

    // Start with an asymmetrical, connected patch of healthy tissue.
    let cx = width / 2;
    let cy = height / 2;
    for (let y = -126; y <= 126; y += 30) {
      for (let x = -215; x <= 215; x += 30) {
        let edge = 1 + 0.12 * sin(atan2(y, x) * 3 + 0.8);
        let inside = sq(x / (206 * edge)) + sq(y / (126 * edge));
        if (inside < 1 && random(1) > 0.035) {
          this.cells.push(new Cell(cx + x + random(-4, 4),
                                   cy + y + random(-4, 4), false));
        }
      }
    }
  }

  changeMutation(direction) {
    // Change the environment, not an individual cell.
    this.mutationRate = constrain(this.mutationRate + direction * 0.012,
                                  0.0001, 0.074);
    this.environmentPulse = 26;
  }

  mutatedFraction() {
    if (this.cells.length === 0) return 0;
    return this.countMutated() / this.cells.length;
  }

  effectiveMutationChance() {
    // Artistic model rule: a heavily mutated tissue raises pressure on survivors.
    // The final 15% of the process gains a smooth pressure boost so that a few
    // healthy cells cannot leave the simulation waiting indefinitely.
    // This is NOT a claim that cancer is contagious or that real mutation behaves this way.
    let stress = constrain((this.mutatedFraction() - 0.85) / 0.15, 0, 1);
    return min(0.62, this.mutationRate + 0.48 * stress * stress);
  }

  statusText() {
    if (this.status === 'collapsing') return 'TISSUE COLLAPSING';
    if (this.status === 'collapsed') return 'EXPERIMENT ENDED';
    return 'GROWING';
  }

  environmentName() {
    if (this.mutationRate < 0.003) return 'LOW';
    if (this.mutationRate < 0.018) return 'MODERATE';
    if (this.mutationRate < 0.042) return 'HIGH';
    return 'EXTREME';
  }

  newMutation(x, y) {
    this.mutationEvents++;
    this.mutationsThisStep++;
    this.flashes.push({ x: x, y: y, size: 5, alpha: 220 });
  }

  update() {
    // Collapse is a separate final state; the cells stop dividing.
    if (this.status === 'collapsed') return;
    if (this.status === 'collapsing') {
      this.collapseFrames++;
      for (let cell of this.cells) {
        // The tissue loses its connections and its former body shape.
        cell.x += (cell.x - width / 2) * 0.0014 + sin(cell.phase + frameCount * 0.07) * 0.25;
        cell.y += (cell.y - height / 2) * 0.0014 + cos(cell.phase + frameCount * 0.06) * 0.22;
        cell.radius = max(3.5, cell.radius - 0.082);
      }
      if (this.collapseFrames >= 165) this.status = 'collapsed';
      return;
    }

    // Growth happens in steps rather than on every animation frame.
    if (frameCount % 16 === 0) {
      this.mutationsThisStep = 0;
      this.currentChance = this.effectiveMutationChance();
      let oldCount = this.cells.length;
      for (let i = 0; i < oldCount; i++) {
        this.cells[i].update(this);
      }
      if (this.mutationsThisStep > 0) {
        this.lastBurst = this.mutationsThisStep;
        this.burstDisplayFrames = 55;
        // ONE short ping for EACH spontaneous mutation in the current step.
        playMutationSounds(this.mutationsThisStep, this.mutatedFraction());
      }
    }
    if (frameCount % 2 === 0) this.separateCells();

    // Only the complete loss of healthy cells triggers the ending.
    if (this.cells.length > 0 && this.countHealthy() === 0) {
      this.startCollapse();
    }

    for (let flash of this.flashes) {
      flash.size += 2.7;
      flash.alpha -= 6;
    }
    this.flashes = this.flashes.filter(function (flash) {
      return flash.alpha > 0;
    });
    this.environmentPulse = max(0, this.environmentPulse - 0.7);
    this.burstDisplayFrames = max(0, this.burstDisplayFrames - 1);
  }

  startCollapse() {
    if (this.status !== 'growing') return;
    this.status = 'collapsing';
    this.collapseFrames = 0;
    this.finalStats = {
      cells: this.cells.length,
      mutationEvents: this.mutationEvents,
      mutatedCells: this.countMutated(),
      seconds: Math.round((frameCount - this.startFrame) / 30)
    };
    playCollapseSound();
  }

  separateCells() {
    // Daughter cells physically push their neighbors outward.
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = i + 1; j < this.cells.length; j++) {
        let a = this.cells[i];
        let b = this.cells[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = sqrt(dx * dx + dy * dy);
        let desired = (a.radius + b.radius) * 0.94;
        if (d > 0.001 && d < desired) {
          let push = (desired - d) * 0.13;
          a.x -= dx / d * push;
          a.y -= dy / d * push;
          b.x += dx / d * push;
          b.y += dy / d * push;
        }
      }
    }
    for (let cell of this.cells) {
      cell.x = constrain(cell.x, 45, width - 45);
      cell.y = constrain(cell.y, 48, height - 48);
    }
  }

  countMutated() {
    let result = 0;
    for (let cell of this.cells) if (cell.mutated) result++;
    return result;
  }

  countHealthy() {
    return this.cells.length - this.countMutated();
  }

  display() {
    push();
    let fade = this.status === 'growing' ? 1 : max(0.12, 1 - this.collapseFrames / 174);
    drawingContext.globalAlpha = fade;
    if (this.status === 'growing' || this.collapseFrames < 50) this.drawTissueMembrane();

    // Draw thicker connections between touching neighbors.
    // These overlapping connections make the cluster read as one tissue.
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = i + 1; j < this.cells.length; j++) {
        let a = this.cells[i];
        let b = this.cells[j];
        let d = dist(a.x, a.y, b.x, b.y);
        if (d < 39) {
          strokeWeight(20);
          if (a.mutated && b.mutated) stroke(113, 47, 58, 86);
          else stroke(146, 108, 107, 55);
          line(a.x, a.y, b.x, b.y);
        }
      }
    }

    for (let cell of this.cells) cell.display();

    // Visual feedback for spontaneous mutation events.
    noFill();
    for (let flash of this.flashes) {
      stroke(233, 112, 119, flash.alpha);
      strokeWeight(1.7);
      circle(flash.x, flash.y, flash.size * 2);
    }

    // User input creates a field-wide signal; it never touches a cell directly.
    if (this.environmentPulse > 0) {
      noFill();
      stroke(195, 96, 106, this.environmentPulse * 4);
      strokeWeight(2);
      rect(23, 20, width - 46, height - 40, 15);
    }
    pop();
  }

  displayEnding() {
    if (this.status === 'growing') return;
    let progress = min(1, this.collapseFrames / 110);
    push();
    noStroke();
    fill(12, 10, 14, progress * 213);
    rect(0, 0, width, height);
    textAlign(CENTER, CENTER);
    fill(222, 156, 151, progress * 255);
    textFont('monospace');
    textSize(13);
    text('EXPERIMENT COMPLETE  /  100% MUTATED', width / 2, height / 2 - 61);
    fill(242, 218, 204, progress * 255);
    textSize(34);
    text('TISSUE COLLAPSE', width / 2, height / 2 - 15);
    fill(189, 168, 159, progress * 255);
    textSize(13);
    text('All healthy cells have disappeared.', width / 2, height / 2 + 33);
    if (this.finalStats) {
      text('Cells: ' + this.finalStats.cells + '  /  Spontaneous mutations: ' +
           this.finalStats.mutationEvents + '  /  Time: ' + this.finalStats.seconds + 's',
           width / 2, height / 2 + 58);
    }
    textSize(11);
    fill(214, 144, 143, progress * 255);
    text('CLICK REGENERATE TISSUE TO START ANOTHER EXPERIMENT', width / 2, height / 2 + 101);
    pop();
  }

  drawTissueMembrane() {
    if (this.cells.length < 3) return;

    // Approximate a smooth envelope around all cell positions.
    let centerX = 0;
    let centerY = 0;
    for (let cell of this.cells) {
      centerX += cell.x;
      centerY += cell.y;
    }
    centerX /= this.cells.length;
    centerY /= this.cells.length;

    let pointCount = 48;
    let radii = [];
    for (let i = 0; i < pointCount; i++) radii.push(0);

    for (let cell of this.cells) {
      let angle = atan2(cell.y - centerY, cell.x - centerX);
      let index = floor((angle + PI) / TWO_PI * pointCount);
      let d = dist(centerX, centerY, cell.x, cell.y) + cell.radius * 0.8;
      for (let offset = -2; offset <= 2; offset++) {
        let bin = (index + offset + pointCount) % pointCount;
        radii[bin] = max(radii[bin], d - abs(offset) * 4);
      }
    }

    // Smooth the outer membrane so it looks flexible, not polygonal.
    for (let pass = 0; pass < 3; pass++) {
      let next = [];
      for (let i = 0; i < pointCount; i++) {
        let before = radii[(i + pointCount - 1) % pointCount];
        let after = radii[(i + 1) % pointCount];
        next[i] = before * 0.22 + radii[i] * 0.56 + after * 0.22;
      }
      radii = next;
    }

    // Multiple translucent layers create the feeling of a tissue membrane.
    for (let layer = 3; layer >= 0; layer--) {
      let extra = layer * 4;
      if (layer === 0) {
        fill(91, 65, 69, 135);
        stroke(201, 150, 139, 135);
        strokeWeight(1.5);
      } else {
        noStroke();
        fill(151, 94, 93, layer === 3 ? 10 : 18);
      }
      beginShape();
      for (let i = -2; i <= pointCount + 2; i++) {
        let index = (i + pointCount * 2) % pointCount;
        let angle = index / pointCount * TWO_PI - PI;
        let r = radii[index] + extra;
        curveVertex(centerX + cos(angle) * r,
                    centerY + sin(angle) * r);
      }
      endShape(CLOSE);
    }
  }
}


// -----------------------------------------------------
// SOUND — no imported files or p5.sound dependency.
// Audio begins only when the visitor clicks Enable Sound.
// -----------------------------------------------------
function toggleSound() {
  if (!audioContext) {
    let AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) {
      soundButton.html('Sound Unavailable');
      return;
    }
    audioContext = new AudioClass();
    audioMasterGain = audioContext.createGain();
    audioMasterGain.gain.value = 0;
    audioMasterGain.connect(audioContext.destination);
  }
  soundEnabled = !soundEnabled;
  let now = audioContext.currentTime;
  if (soundEnabled) {
    if (audioContext.state === 'suspended') audioContext.resume();
    audioMasterGain.gain.setTargetAtTime(1, now, 0.012);
    nextMutationToneTime = now;
    soundButton.html('Mute Sound');
    playTone(260, 360, 0.24, 0.043, 'sine');
    lastBeatFrame = frameCount;
  } else {
    // Master gain also silences notes that were already scheduled.
    audioMasterGain.gain.setTargetAtTime(0, now, 0.012);
    soundButton.html('Enable Sound');
  }
}

// Creates a short sound with a soft attack and fade-out.
function playTone(startHz, endHz, duration, volume, wave, startAt) {
  if (!soundEnabled || !audioContext) return;
  let t = startAt === undefined ? audioContext.currentTime :
          Math.max(audioContext.currentTime, startAt);
  let osc = audioContext.createOscillator();
  let gain = audioContext.createGain();
  osc.type = wave || 'sine';
  osc.frequency.setValueAtTime(startHz, t);
  osc.frequency.exponentialRampToValueAtTime(max(25, endHz), t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(max(0.0002, volume), t + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(audioMasterGain);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function playHeartbeat(mutatedFraction) {
  // More mutated cells = a faster, slightly higher and fuller background pulse.
  let hz = 72 + mutatedFraction * 55;
  let volume = 0.018 + mutatedFraction * 0.015;
  playTone(hz, hz * 0.68, 0.18, volume, 'sine');
  if (mutatedFraction > 0.55) {
    playTone(hz * 0.84, hz * 0.58, 0.12, volume * 0.54,
             'sine', audioContext.currentTime + 0.18);
  }
}

function playMutationSounds(count, fraction) {
  if (!soundEnabled || !audioContext || count <= 0) return;
  // Each NEW spontaneous mutation generates one short audible note.
  // Space the notes to keep a burst of several mutations distinguishable.
  let t = Math.max(audioContext.currentTime + 0.012, nextMutationToneTime);
  for (let i = 0; i < count; i++) {
    let hz = 300 + (i % 5) * 34 + fraction * 90;
    playTone(hz, hz * 0.72, 0.12, 0.032, 'triangle', t);
    t += 0.06;
  }
  nextMutationToneTime = t;
}

function playControlSound(increased) {
  playTone(increased ? 230 : 350, increased ? 390 : 185, 0.17, 0.048, 'sine');
}

function playRegenerationSound() {
  playTone(125, 310, 0.55, 0.065, 'triangle');
}

function playCollapseSound() {
  playTone(190, 41, 2.7, 0.11, 'sawtooth');
  playTone(79, 32, 3.2, 0.045, 'sine');
}
