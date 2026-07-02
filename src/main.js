import './style.css'
import { Flock } from './flock.js'

const canvas = document.getElementById('murmuration-canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const flock = new Flock(width, height);

// Background + trail settings per mode. Trails are painted by filling the frame
// with a translucent background color instead of clearing it; a lighter day
// background needs a faster fade (higher alpha) or trails smear into mud.
const MODES = {
  day: { bg: 'rgb(250, 251, 247)', fade: 'rgba(250, 251, 247, 0.12)' },   // paper-white #fafbf7
  night: { bg: 'rgb(15, 27, 20)', fade: 'rgba(15, 27, 20, 0.07)' },       // forest-ink #0f1b14
};

// Allow ?mode=day / ?mode=night to force a mode (and freeze the time-based
// auto-switch) so both looks are checkable at any hour.
const forcedMode = new URLSearchParams(window.location.search).get('mode');
const modeIsForced = forcedMode === 'day' || forcedMode === 'night';

// Night mode detection based on Pacific Time
function isNightInPacific() {
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const hour = pacificTime.getHours();
  return hour >= 19 || hour < 6;
}

function computeNight() {
  return modeIsForced ? forcedMode === 'night' : isNightInPacific();
}

let isNightMode = computeNight();

function applyBodyMode() {
  if (isNightMode) {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }
}

// Paint the whole canvas opaque with the current background (init, resize, and
// on a mode flip — so old-color ghost trails don't linger through the fade).
function paintBackground() {
  ctx.globalAlpha = 1;
  ctx.fillStyle = MODES[isNightMode ? 'night' : 'day'].bg;
  ctx.fillRect(0, 0, width, height);
}

applyBodyMode();
paintBackground();

function updateNightMode() {
  const next = computeNight();
  if (next !== isNightMode) {
    isNightMode = next;
    applyBodyMode();
    paintBackground(); // hard clear on transition
  }
}

if (!modeIsForced) {
  setInterval(updateNightMode, 60000);
}

const boidCount = window.innerWidth < 768 ? 2000 : 5000;
for (let i = 0; i < boidCount; i++) {
  flock.addBoid();
}
flock.sortByDepth();

let mouse = { x: width / 2, y: height / 2 };
let repulsionTargets = [];

function animate() {
  // Trail effect: fade the previous frame toward the background instead of clearing.
  ctx.globalAlpha = 1;
  ctx.fillStyle = MODES[isNightMode ? 'night' : 'day'].fade;
  ctx.fillRect(0, 0, width, height);

  flock.update(mouse, repulsionTargets);
  flock.draw(ctx, isNightMode);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  flock.resize(width, height);
  paintBackground();
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const targets = document.querySelectorAll('.repel-target');
targets.forEach(target => {
  target.addEventListener('mouseenter', () => {
    const rect = target.getBoundingClientRect();
    repulsionTargets.push({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });
  });

  target.addEventListener('mouseleave', () => {
    const rect = target.getBoundingClientRect();
    repulsionTargets = repulsionTargets.filter(t => t.x !== rect.left || t.y !== rect.top);
  });
});
