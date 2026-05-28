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

// ====== Video rendering ======
let pendingBitmap = null;
let decoding = false;

function render() {
  if (pendingBitmap) {
    ctx.drawImage(pendingBitmap, 0, 0, canvas.width, canvas.height);
    pendingBitmap.close();
    pendingBitmap = null;
  }
  requestAnimationFrame(render);
}
render();

const supportsBitmap = typeof createImageBitmap !== 'undefined';

function showFrame(data) {
  const blob = new Blob([data], { type: 'image/jpeg' });

  if (supportsBitmap) {
    if (decoding) return;
    decoding = true;
    createImageBitmap(blob).then((bitmap) => {
      decoding = false;
      if (pendingBitmap) pendingBitmap.close();
      pendingBitmap = bitmap;
    }).catch(() => { decoding = false; });
  } else {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}

// ====== WebSocket ======
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
      showFrame(e.data);
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
