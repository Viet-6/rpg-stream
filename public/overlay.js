(function () {
  const overlay = document.getElementById('overlay');
  let controlsHidden = false;

  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'overlay-toggle-btn';
  toggleBtn.textContent = 'Hide';

  function setControlsHidden(hidden) {
    controlsHidden = hidden;
    overlay.classList.toggle('controls-hidden', controlsHidden);
    toggleBtn.textContent = controlsHidden ? 'Show' : 'Hide';
  }

  toggleBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    setControlsHidden(!controlsHidden);
  });

  overlay.appendChild(toggleBtn);
  const pressed = {};

  function send(type, key) {
    const data = JSON.stringify({ type, key });
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
      window.ws.send(data);
    }
  }

  function makeButton(label, key, klass) {
    const btn = document.createElement('div');
    btn.className = klass;
    btn.textContent = label;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (pressed[key]) return;
      pressed[key] = true;
      send('press', key);
    });
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      pressed[key] = false;
    });
    btn.addEventListener('pointerleave', () => {
      pressed[key] = false;
    });
    btn.addEventListener('pointercancel', () => {
      pressed[key] = false;
    });
    return btn;
  }

  const dpad = document.createElement('div');
  dpad.className = 'dpad';
  dpad.appendChild(makeButton('\u25B2', 'ArrowUp', 'dpad-btn dpad-up'));
  dpad.appendChild(makeButton('\u25BC', 'ArrowDown', 'dpad-btn dpad-down'));
  dpad.appendChild(makeButton('\u25C0', 'ArrowLeft', 'dpad-btn dpad-left'));
  dpad.appendChild(makeButton('\u25B6', 'ArrowRight', 'dpad-btn dpad-right'));
  overlay.appendChild(dpad);

  const actions = document.createElement('div');
  actions.className = 'actions';
  for (const [label, key] of [
    ['A', 'a'], ['S', 's'], ['D', 'd'], ['Q', 'q'], ['W', 'w'],
    ['Z', 'z'], ['X', 'x'],
    ['SHIFT', 'Shift'], ['\u23CE', 'Enter'], ['ESC', 'Escape'],
  ]) {
    actions.appendChild(makeButton(label, key, 'action-btn'));
  }
  overlay.appendChild(actions);
})();
