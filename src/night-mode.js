// Night mode detection based on Pacific Time
function isNightInPacific() {
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const hour = pacificTime.getHours();
  // Night is between 7pm (19) and 6am (6)
  return hour >= 19 || hour < 6;
}

function updateNightMode() {
  if (isNightInPacific()) {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }
}

// Initial check and periodic updates (every minute)
updateNightMode();
setInterval(updateNightMode, 60000);
