import './style.css'
import { Flock } from './flock.js'

const canvas = document.getElementById('murmuration-canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const flock = new Flock(width, height);

// Night mode detection based on Pacific Time
function isNightInPacific() {
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const hour = pacificTime.getHours();
  // Night is between 7pm (19) and 6am (6)
  return hour >= 19 || hour < 6;
}

let isNightMode = isNightInPacific();

function updateNightMode() {
  isNightMode = isNightInPacific();
  if (isNightMode) {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }
}

// Initial check and periodic updates (every minute)
updateNightMode();
setInterval(updateNightMode, 60000);

// Add initial boids
for (let i = 0; i < 1500; i++) {
  flock.addBoid();
}

let mouse = { x: width / 2, y: height / 2 };
let repulsionTargets = [];

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Update and draw flock
  flock.update(mouse, repulsionTargets);
  flock.draw(ctx, isNightMode);

  requestAnimationFrame(animate);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  flock.resize(width, height);
});

// Handle mouse move
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Handle repulsion targets
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
    // Remove target (simplified logic assuming only one hover at a time or full rebuild)
    // For robustness, filter by matching rect, but since we push/pop on enter/leave, 
    // we can just filter out this specific one or clear if we assume single pointer.
    // Better: Rebuild list on every frame or just manage state.
    // Simplest robust way:
    const rect = target.getBoundingClientRect();
    repulsionTargets = repulsionTargets.filter(t => t.x !== rect.left || t.y !== rect.top);
  });
});
