const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const { execFile } = require('child_process');

const config = require('./config');
const { Broadcaster } = require('./src/broadcaster');
const { setupSignaling, broadcastFrame } = require('./src/signaling');
const { createInputHandler } = require('./src/input');

execFile(config.ffmpeg.cmd, ['-version'], (err) => {
  if (err) {
    console.error(`[server] ERROR: ${config.ffmpeg.cmd} not found.`);
    process.exit(1);
  }
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const broadcaster = new Broadcaster(config);
const inputHandler = createInputHandler(config);

setupSignaling(wss, inputHandler);

broadcaster.on('frame', (frame) => {
  broadcastFrame(frame);
});

broadcaster.start();

server.listen(config.port, config.host, () => {
  console.log(`[server] http://${config.host}:${config.port}`);
});

process.on('SIGINT', () => {
  broadcaster.stop();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  broadcaster.stop();
  server.close(() => process.exit(0));
});
