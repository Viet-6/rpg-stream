const statusEl = document.getElementById('status');
const canvas = document.getElementById('canvas');
const overlay = document.getElementById('overlay');

const ctx = canvas.getContext('2d');

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
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      pendingBitmap = bitmap;
    }).catch(() => { decoding = false; });
  } else {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
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

// ====== Fullscreen ======
const fsBtn = document.getElementById('fullscreen-btn');

fsBtn.addEventListener('click', () => {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {});
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  fsBtn.classList.toggle('hidden', !!document.fullscreenElement);
});
document.addEventListener('webkitfullscreenchange', () => {
  fsBtn.classList.toggle('hidden', !!document.webkitFullscreenElement);
});
