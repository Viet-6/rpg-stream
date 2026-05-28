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

  function sendKey(type, key) {
    const data = JSON.stringify({ type, key });
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
      window.ws.send(data);
    }
  }

  function sendKeydown(key) { sendKey('keydown', key); }
  function sendKeyup(key) { sendKey('keyup', key); }

  function makeDpadButton(dir, label, klass) {
    const btn = document.createElement('div');
    btn.className = 'dpad-btn ' + klass;
    btn.textContent = label;
    const key = 'Arrow' + dir;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (pressed[key]) return;
      pressed[key] = true;
      sendKeydown(key);
    });
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      if (!pressed[key]) return;
      pressed[key] = false;
      sendKeyup(key);
    });
    btn.addEventListener('pointerleave', () => {
      if (!pressed[key]) return;
      pressed[key] = false;
      sendKeyup(key);
    });
    return btn;
  }

  const dpad = document.createElement('div');
  dpad.className = 'dpad';
  dpad.appendChild(makeDpadButton('Up', '\u25B2', 'dpad-up'));
  dpad.appendChild(makeDpadButton('Down', '\u25BC', 'dpad-down'));
  dpad.appendChild(makeDpadButton('Left', '\u25C0', 'dpad-left'));
  dpad.appendChild(makeDpadButton('Right', '\u25B6', 'dpad-right'));
  overlay.appendChild(dpad);

  const actions = document.createElement('div');
  actions.className = 'actions';

  function makeActionBtn(label, key) {
    const btn = document.createElement('div');
    btn.className = 'action-btn';
    btn.textContent = label;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (pressed[key]) return;
      pressed[key] = true;
      sendKeydown(key);
    });
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      if (!pressed[key]) return;
      pressed[key] = false;
      sendKeyup(key);
    });
    btn.addEventListener('pointerleave', () => {
      if (!pressed[key]) return;
      pressed[key] = false;
      sendKeyup(key);
    });
    return btn;
  }

  actions.appendChild(makeActionBtn('Z', 'z'));
  actions.appendChild(makeActionBtn('X', 'x'));
  actions.appendChild(makeActionBtn('\u23CE', 'Enter'));
  actions.appendChild(makeActionBtn('ESC', 'Escape'));
  overlay.appendChild(actions);
})();
