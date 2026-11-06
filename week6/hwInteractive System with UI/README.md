# Mutating Bodies — Simplified Classroom Version

This project uses p5.js and two classes: `Cell` and `Tissue`.

## Run locally
Open `sketch_local.html` with VS Code Live Server (internet is needed for the p5.js library).

## Publish
1. Copy `sketch.js` into your **existing** p5.js Editor project: https://editor.p5js.org/bubble-555/sketches/xqNbW7cfC
2. Choose p5.js **1.x**, run and save it.
3. Put `index.html`, `UML.svg`, `sketch.js`, and `sketch_local.html` in the class project folder in your GitHub repository. Update / commit / push.
4. Open your GitHub Pages site and check that the sketch and UML load.

The GitHub page embeds the **p5.js Editor sketch**. It only shows the new code after you save the new version in p5.js Editor.

## 30-second explanation
- `Cell` stores position and mutation state; it can count neighbors, divide, and draw itself.
- `Tissue` stores all the cells, handles overlapping cells, and controls mutation probability.
- Normal cells stop dividing when crowded. Mutated cells ignore the crowding rule.
- The buttons indirectly change the environment. Each new mutation makes a short sound.
- The overall shape emerges from local division and pushing; we never draw a fixed final shape.
- When all cells mutate, the tissue fades out. This is an artistic rule, not real biology.

## Final screen fix
When the tissue reaches the final collapsed state, the canvas is fully cleared before the ending text is drawn. The membrane is not rendered underneath the ending.
