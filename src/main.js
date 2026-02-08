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

updateNightMode();
setInterval(updateNightMode, 60000);

const boidCount = window.innerWidth < 768 ? 2000 : 5000;
for (let i = 0; i < boidCount; i++) {
  flock.addBoid();
}

let mouse = { x: width / 2, y: height / 2 };
let repulsionTargets = [];

function animate() {
  ctx.clearRect(0, 0, width, height);
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
