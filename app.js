const body = document.body;
const barrier = document.querySelector("#barrier");
const chapter = document.querySelector("#chapter");
const message = document.querySelector("#message");
const instruction = document.querySelector("#instruction");
const resetButton = document.querySelector("#resetButton");
const cameraButton = document.querySelector("#cameraButton");
const permissionCard = document.querySelector("#permissionCard");
const allowCamera = document.querySelector("#allowCamera");
const skipCamera = document.querySelector("#skipCamera");
const video = document.querySelector("#camera");
const status = document.querySelector("#status");
const tweaksButton = document.querySelector("#tweaksButton");
const tweaksPanel = document.querySelector("#tweaksPanel");
const closeTweaks = document.querySelector("#closeTweaks");
const particles = document.querySelector("#particles");

let phase = 0;
let stream = null;

const copy = [
  {
    chapter: "01 · DEFINED",
    message: "Labels make distance visible.",
    instruction: "Touch the barrier. Listen for the fracture.",
  },
  {
    chapter: "02 · THE FRACTURE",
    message: "Understanding begins with one step closer.",
    instruction: "Touch again and let the barrier dissolve.",
  },
];

function setPhase(next) {
  phase = next;
  body.dataset.phase = next === 0 ? "contained" : next === 1 ? "cracked" : "released";
  resetButton.disabled = next === 0;

  if (next < 2) {
    chapter.textContent = copy[next].chapter;
    message.textContent = copy[next].message;
    instruction.textContent = copy[next].instruction;
  }
}

function advance() {
  if (phase === 0) setPhase(1);
  else if (phase === 1) setPhase(2);
}

barrier.addEventListener("click", advance);
resetButton.addEventListener("click", () => setPhase(0));

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    status.lastChild.textContent = "Camera Not Supported";
    hidePermission();
    return;
  }

  try {
    stream?.getTracks().forEach((track) => track.stop());
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    body.classList.add("camera-ready");
    cameraButton.querySelector("span:last-child").textContent = "Camera Enabled";
    status.lastChild.textContent = "Live Camera Layer";
    hidePermission();
  } catch (error) {
    console.warn("Camera access unavailable:", error);
    status.lastChild.textContent = "Preview Mode";
    cameraButton.querySelector("span:last-child").textContent = "Retry Camera";
    hidePermission();
  }
}

function hidePermission() {
  permissionCard.classList.add("hidden");
  window.setTimeout(() => { permissionCard.hidden = true; }, 650);
}

allowCamera.addEventListener("click", startCamera);
cameraButton.addEventListener("click", startCamera);
skipCamera.addEventListener("click", hidePermission);

function setTweaks(open) {
  tweaksPanel.hidden = !open;
  tweaksButton.setAttribute("aria-expanded", String(open));
}

tweaksButton.addEventListener("click", () => setTweaks(tweaksPanel.hidden));
closeTweaks.addEventListener("click", () => setTweaks(false));

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    body.dataset.intensity = button.dataset.preset;
    document.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("active", item === button));
  });
});

for (let index = 0; index < 28; index += 1) {
  const particle = document.createElement("span");
  particle.className = "particle";
  particle.style.setProperty("--x", `${18 + Math.random() * 66}%`);
  particle.style.setProperty("--y", `${35 + Math.random() * 42}%`);
  particle.style.setProperty("--drift", `${-32 + Math.random() * 64}px`);
  particle.style.setProperty("--delay", `${Math.random() * 3.8}s`);
  particle.style.animationDuration = `${3 + Math.random() * 2.8}s`;
  particles.appendChild(particle);
}

window.addEventListener("pagehide", () => stream?.getTracks().forEach((track) => track.stop()));
setPhase(0);
