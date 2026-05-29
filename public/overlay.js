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
      send('keydown', key);
    });
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      pressed[key] = false;
      send('keyup', key);
    });
    btn.addEventListener('pointerleave', () => {
      pressed[key] = false;
      send('keyup', key);
    });
    btn.addEventListener('pointercancel', () => {
      pressed[key] = false;
      send('keyup', key);
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

  const actionGroup1 = document.createElement('div');
  actionGroup1.className = 'actions top-left';
  for (const [label, key] of [
    ['SHIFT', 'Shift'],
  ]) {
    actionGroup1.appendChild(makeButton(label, key, 'action-btn'));
  }
  actions.appendChild(actionGroup1);

  const actionGroup2 = document.createElement('div');
  actionGroup2.className = 'actions bottom';
  for (const [label, key] of [
    ['A', 'a'], ['S', 's'],
  ]) {
    actionGroup2.appendChild(makeButton(label, key, 'action-btn'));
  }
  actions.appendChild(actionGroup2);

  const actionGroup3 = document.createElement('div');
  actionGroup3.className = 'actions bottom-2';
  for (const [label, key] of [
    ['Q', 'q'], ['W', 'w'],
  ]) {
    actionGroup3.appendChild(makeButton(label, key, 'action-btn'));
  }
  actions.appendChild(actionGroup3);

  const actionGroup4 = document.createElement('div');
  actionGroup4.className = 'actions';
  for (const [label, key] of [
    ['D', 'd'], ['X', 'x'], ['Z', 'z']
  ]) {
    actionGroup4.appendChild(makeButton(label, key, 'action-btn'));
  }
  actions.appendChild(actionGroup4);

  overlay.appendChild(actions);
})();
