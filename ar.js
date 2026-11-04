const body = document.body;
const scene = document.querySelector("#arScene");
const target = document.querySelector("#fishTarget");
const effectRoot = document.querySelector("#effectRoot");
const barrierGroup = document.querySelector("#barrierGroup");
const fogGroup = document.querySelector("#fogGroup");
const crackLayer = document.querySelector("#crackLayer");
const startCard = document.querySelector("#startCard");
const startScan = document.querySelector("#startScan");
const scanGuide = document.querySelector("#scanGuide");
const scanInstruction = document.querySelector("#scanInstruction");
const trackingStatus = document.querySelector("#trackingStatus span");
const barrierAction = document.querySelector("#barrierAction");
const resetExperience = document.querySelector("#resetExperience");
const interactionCopy = document.querySelector("#interactionCopy");
const chapter = document.querySelector("#chapter");
const message = document.querySelector("#message");
const finalMessage = document.querySelector("#finalMessage");
const errorCard = document.querySelector("#errorCard");
const retryCamera = document.querySelector("#retryCamera");
const calibration = document.querySelector("#calibration");
const openCalibration = document.querySelector("#openCalibration");
const closeCalibration = document.querySelector("#closeCalibration");
const resetCalibration = document.querySelector("#resetCalibration");
const offsetX = document.querySelector("#offsetX");
const offsetY = document.querySelector("#offsetY");
const effectScale = document.querySelector("#effectScale");

let phase = 0;
let started = false;
let tracked = false;

const defaults = { x: 0.252, y: 0.013, scale: 1 };

function waitForScene() {
  if (scene.hasLoaded) return Promise.resolve();
  return new Promise((resolve) => scene.addEventListener("loaded", resolve, { once: true }));
}

function updatePhase(next) {
  phase = next;
  body.dataset.phase = next === 0 ? "contained" : next === 1 ? "cracked" : "released";
  crackLayer.setAttribute("visible", next === 1);
  barrierGroup.setAttribute("visible", next < 2);
  fogGroup.setAttribute("visible", next < 2);
  resetExperience.disabled = next === 0;

  if (next === 0) {
    chapter.textContent = "01 · DEFINED";
    message.textContent = "Labels make distance visible.";
    barrierAction.textContent = "Touch the barrier";
    finalMessage.classList.remove("visible");
    interactionCopy.classList.remove("released");
  } else if (next === 1) {
    chapter.textContent = "02 · THE FRACTURE";
    message.textContent = "Understanding begins with one step closer.";
    barrierAction.textContent = "Touch again to release";
  } else {
    barrierAction.textContent = "Released";
    barrierAction.disabled = true;
    interactionCopy.classList.add("released");
    finalMessage.classList.add("visible");
  }
}

function updateTracking(isTracked) {
  tracked = isTracked;
  body.dataset.tracking = isTracked ? "found" : "searching";
  trackingStatus.textContent = isTracked ? "Fish recognized" : "Searching for fish";
  scanInstruction.textContent = isTracked
    ? "Target locked. The effect is anchored to the lantern."
    : "Align the fish head and central body inside the frame.";
  scanGuide.classList.toggle("target-found", isTracked);
  interactionCopy.classList.toggle("visible", isTracked && phase < 2);
  barrierAction.disabled = !isTracked || phase >= 2;
}

async function beginScan() {
  if (started) return;
  startScan.disabled = true;
  startScan.textContent = "Starting camera…";
  errorCard.hidden = true;

  try {
    await waitForScene();
    await scene.systems["mindar-image-system"].start();
    started = true;
    body.dataset.tracking = "searching";
    startCard.classList.add("hidden");
    window.setTimeout(() => { startCard.hidden = true; }, 600);
    scanGuide.classList.add("active");
    trackingStatus.textContent = "Searching for fish";
  } catch (error) {
    console.error(error);
    startScan.disabled = false;
    startScan.textContent = "Begin Live Scan";
    errorCard.hidden = false;
  }
}

target.addEventListener("targetFound", () => updateTracking(true));
target.addEventListener("targetLost", () => updateTracking(false));
startScan.addEventListener("click", beginScan);
retryCamera.addEventListener("click", beginScan);

barrierAction.addEventListener("click", () => {
  if (!tracked || phase >= 2) return;
  updatePhase(phase + 1);
});
resetExperience.addEventListener("click", () => {
  updatePhase(0);
  updateTracking(tracked);
});

function applyCalibration(values, persist = true) {
  const x = Number(values.x);
  const y = Number(values.y);
  const scale = Number(values.scale);
  effectRoot.setAttribute("position", `${x} ${y} 0.02`);
  effectRoot.setAttribute("scale", `${scale} ${scale} ${scale}`);
  offsetX.value = x;
  offsetY.value = y;
  effectScale.value = scale;
  document.querySelector("#offsetXValue").value = x.toFixed(3);
  document.querySelector("#offsetYValue").value = y.toFixed(3);
  document.querySelector("#scaleValue").value = scale.toFixed(2);
  if (persist) localStorage.setItem("fish-ar-calibration", JSON.stringify({ x, y, scale }));
}

function readSliders() {
  applyCalibration({ x: offsetX.value, y: offsetY.value, scale: effectScale.value });
}

[offsetX, offsetY, effectScale].forEach((input) => input.addEventListener("input", readSliders));
openCalibration.addEventListener("click", () => { calibration.hidden = false; });
closeCalibration.addEventListener("click", () => { calibration.hidden = true; });
resetCalibration.addEventListener("click", () => applyCalibration(defaults));

document.querySelectorAll("[data-intensity]").forEach((button) => {
  button.addEventListener("click", () => {
    body.dataset.intensity = button.dataset.intensity;
    document.querySelectorAll("[data-intensity]").forEach((item) => item.classList.toggle("active", item === button));
  });
});

try {
  applyCalibration(JSON.parse(localStorage.getItem("fish-ar-calibration")) || defaults, false);
} catch {
  applyCalibration(defaults, false);
}
updatePhase(0);
