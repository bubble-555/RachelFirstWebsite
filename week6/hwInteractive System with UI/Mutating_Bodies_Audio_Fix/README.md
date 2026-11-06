# Mutating Bodies — GitHub Pages submission

Public web page: `index.html` (in repository root).  
Embedded p5.js Editor sketch: https://editor.p5js.org/bubble-555/full/xqNbW7cfC  
UML: `UML.svg`  
Local fallback: `sketch_local.html` + `sketch.js` (loaded with p5.js 1.11.11 from a CDN).

## Publish through GitHub Pages

1. On GitHub, create a new **Public** repository named `Mutating-Bodies` (or use your existing class repository).
2. Go to **Add file → Upload files** and upload the **individual files from this folder**. Do **not** upload the ZIP as one file.
3. **Commit changes** to the `main` branch.
4. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch** → `main` → `/(root)` → **Save**.
5. Use the website URL shown under Pages after publishing. It usually looks like `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

If using an existing class repository, put the files in a distinct folder, e.g. `week6/Mutating-Bodies/`, then use its Pages URL plus that folder path (provided Pages is enabled for the repository).

Important: The p5.js Editor sketch must run under a p5.js **1.x** version, since the source uses `curveVertex()` from p5.js 1.x. If the live embed is blank, switch the editor version to 1.x, save, and reload the published page. The local fallback uses 1.11.11.
