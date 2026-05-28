const statusEl = document.getElementById('status');
const canvas = document.getElementById('canvas');
const overlay = document.getElementById('overlay');

const ctx = canvas.getContext('2d');
canvas.width = 3840;
canvas.height = 2160;

function setStatus(msg) {
  statusEl.textContent = msg;
}

const wsUrl = `ws://${location.host}`;
let ws = null;

function connect() {
  setStatus('Connecting...');
  ws = new WebSocket(wsUrl);
  ws.binaryType = 'arraybuffer';
  window.ws = ws;

  ws.onopen = () => {
    setStatus('Streaming');
    overlay.classList.remove('hidden');
  };

  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) {
      const blob = new Blob([e.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  ws.onclose = () => {
    setStatus('Disconnected');
    overlay.classList.add('hidden');
    ws = null;
    window.ws = null;
    setTimeout(connect, 2000);
  };

  ws.onerror = () => {
    setStatus('WebSocket error');
  };
}

setTimeout(connect, 100);
