const clients = new Set();

function setupSignaling(wss, inputHandler) {
  wss.on('connection', (ws) => {
    console.log('[signaling] Client connected');
    clients.add(ws);

    ws.on('message', (data) => {
      let text;
      if (Buffer.isBuffer(data)) {
        text = data.toString('utf8');
      } else if (typeof data === 'string') {
        text = data;
      } else {
        return;
      }

      let msg;
      try {
        msg = JSON.parse(text);
      } catch {
        return;
      }

      if (msg.type === 'keydown' || msg.type === 'keyup') {
        inputHandler(msg.type, msg.key);
      } else if (msg.type === 'press') {
        inputHandler('keydown', msg.key);
        setTimeout(() => inputHandler('keyup', msg.key), 50);
      }
    });

    ws.on('close', () => {
      console.log('[signaling] Client disconnected');
      clients.delete(ws);
    });
  });
}

function broadcastFrame(frame) {
  for (const ws of clients) {
    if (ws.readyState === 1) {
      ws.send(frame);
    }
  }
}

module.exports = { setupSignaling, broadcastFrame };
