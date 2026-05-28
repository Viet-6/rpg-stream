const os = require('os');

const platform = os.platform();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  video: {
    width: parseInt(process.env.VIDEO_WIDTH, 10) || 1920,
    height: parseInt(process.env.VIDEO_HEIGHT, 10) || 1080,
    fps: parseInt(process.env.VIDEO_FPS, 10) || 60,
    quality: parseInt(process.env.VIDEO_QUALITY, 10) || 1,
  },
  ffmpeg: null,
  input: null,
};

const v = config.video;

if (platform === 'linux') {
  config.ffmpeg = {
    cmd: 'ffmpeg',
    args: [
      '-f', 'x11grab',
      '-r', String(v.fps),
      '-i', process.env.DISPLAY || ':0.0',
      '-vf', `scale=${v.width}:${v.height}`,
      '-c:v', 'mjpeg',
      '-q:v', String(v.quality),
      '-f', 'image2pipe',
      'pipe:1',
    ],
  };
  config.input = {
    cmd: 'xdotool',
    keydown: (key) => ['keydown', key],
    keyup: (key) => ['keyup', key],
    keyMap: {
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
      z: 'z',
      x: 'x',
      Enter: 'Return',
      Escape: 'Escape',
    },
  };
} else if (platform === 'win32') {
  config.ffmpeg = {
    cmd: 'ffmpeg',
    args: [
      '-f', 'gdigrab',
      '-r', String(v.fps),
      '-i', 'desktop',
      '-vf', `scale=${v.width}:${v.height}`,
      '-c:v', 'mjpeg',
      '-q:v', String(v.quality),
      '-f', 'image2pipe',
      'pipe:1',
    ],
  };
  config.input = {
    cmd: 'powershell',
    keydown: (key) => [
      '-Command',
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{${key}}')`,
    ],
    keyup: (key) => [
      '-Command',
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{${key}}')`,
    ],
    keyMap: {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      z: 'z',
      x: 'x',
      Enter: 'ENTER',
      Escape: 'ESC',
    },
  };
} else {
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

module.exports = config;
