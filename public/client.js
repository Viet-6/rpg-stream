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

function fitCanvas() {
  if (!canvas.width || !canvas.height) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ar = canvas.width / canvas.height;
  let w, h;
  if (vw / vh > ar) {
    h = vh;
    w = h * ar;
  } else {
    w = vw;
    h = w / ar;
  }
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.style.left = `${(vw - w) / 2}px`;
  canvas.style.top = `${(vh - h) / 2}px`;
}

window.addEventListener('resize', fitCanvas);

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
      fitCanvas();
      pendingBitmap = bitmap;
    }).catch(() => { decoding = false; });
  } else {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      fitCanvas();
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
  fitCanvas();
});
document.addEventListener('webkitfullscreenchange', () => {
  fsBtn.classList.toggle('hidden', !!document.webkitFullscreenElement);
  fitCanvas();
});
