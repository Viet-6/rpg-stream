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

config.capture = {
  mode: process.env.CAPTURE_MODE || 'region',
  windowTitle: process.env.CAPTURE_WINDOW || '',
  x: parseInt(process.env.CAPTURE_X, 10) || 0,
  y: parseInt(process.env.CAPTURE_Y, 10) || 0,
  width: parseInt(process.env.CAPTURE_WIDTH, 10) || 640,
  height: parseInt(process.env.CAPTURE_HEIGHT, 10) || 640,
};

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
    keydownCmd: (key) => `keydown ${key}`,
    keyupCmd: (key) => `keyup ${key}`,
    keypressCmd: (key) => `key ${key}`,
    keyMap: {
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
      a: 'a',
      s: 's',
      d: 'd',
      q: 'q',
      w: 'w',
      z: 'z',
      x: 'x',
      Shift: 'Shift_L',
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
    keydownCmd: (key) =>
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{${key}}')`,
    keyupCmd: (key) =>
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{${key}}')`,
    keypressCmd: (key) =>
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{${key}}')`,
    keyMap: {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      a: 'a',
      s: 's',
      d: 'd',
      q: 'q',
      w: 'w',
      z: 'z',
      x: 'x',
      Shift: 'SHIFT',
      Enter: 'ENTER',
      Escape: 'ESC',
    },
  };
} else {
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

module.exports = config;
