const { spawn, execSync } = require('child_process');
const { EventEmitter } = require('events');
const os = require('os');

const SOI = Buffer.from([0xFF, 0xD8]);
const EOI = Buffer.from([0xFF, 0xD9]);

const platform = os.platform();

class Broadcaster extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.process = null;
    this.buf = Buffer.alloc(0);
  }

  resolveCapture() {
    const c = this.config.capture;
    if (!c || c.mode === 'fullscreen') return null;

    if (platform === 'linux') {
      if (c.mode === 'window' && c.windowTitle) {
        try {
          const id = execSync(
            `xdotool search --name "${c.windowTitle}" | head -1`,
            { timeout: 2000, encoding: 'utf8' }
          ).trim();
          if (id) {
            const geo = execSync(
              `xdotool getwindowgeometry --shell ${id}`,
              { timeout: 2000, encoding: 'utf8' }
            );
            const x = parseInt(geo.match(/X=(\d+)/)?.[1], 10);
            const y = parseInt(geo.match(/Y=(\d+)/)?.[1], 10);
            const w = parseInt(geo.match(/WIDTH=(\d+)/)?.[1], 10);
            const h = parseInt(geo.match(/HEIGHT=(\d+)/)?.[1], 10);
            if (!isNaN(x) && !isNaN(y) && !isNaN(w) && !isNaN(h)) {
              console.log(`[broadcaster] Capturing window "${c.windowTitle}" at ${x},${y} ${w}x${h}`);
              return { x, y, width: w, height: h };
            }
          }
        } catch (e) {
          console.error('[broadcaster] Window detection failed:', e.message);
        }
        console.warn('[broadcaster] Window not found, falling back to fullscreen');
        return null;
      }
      if (c.mode === 'region') {
        console.log(`[broadcaster] Capturing region at ${c.x},${c.y} ${c.width}x${c.height}`);
        return { x: c.x, y: c.y, width: c.width, height: c.height };
      }
    }

    if (platform === 'win32') {
      if (c.mode === 'window' && c.windowTitle) {
        console.log(`[broadcaster] Capturing window "${c.windowTitle}"`);
        return { windowTitle: c.windowTitle };
      }
      if (c.mode === 'region') {
        console.log(`[broadcaster] Capturing region at ${c.x},${c.y} ${c.width}x${c.height}`);
        return { x: c.x, y: c.y, width: c.width, height: c.height };
      }
    }

    return null;
  }

  buildFFmpegArgs(capture) {
    const v = this.config.video;
    const display = process.env.DISPLAY || ':0.0';
    const cmd = this.config.ffmpeg.cmd;

    if (platform === 'linux') {
      const args = ['-f', 'x11grab', '-r', String(v.fps)];
      if (capture) {
        args.push('-i', `${display}+${capture.x},${capture.y}`);
        args.push('-video_size', `${capture.width}x${capture.height}`);
      } else {
        args.push('-i', display);
      }
      args.push(
        '-vf', `scale=${v.width}:${v.height}`,
        '-c:v', 'mjpeg',
        '-q:v', String(v.quality),
        '-f', 'image2pipe',
        'pipe:1'
      );
      return { cmd, args };
    }

    if (platform === 'win32') {
      const args = ['-f', 'gdigrab', '-r', String(v.fps)];
      if (capture && capture.windowTitle) {
        args.push('-i', `title=${capture.windowTitle}`);
      } else {
        args.push('-i', 'desktop');
      }
      if (capture && capture.width != null && !capture.windowTitle) {
        args.push('-vf',
          `crop=${capture.width}:${capture.height}:${capture.x}:${capture.y},scale=${v.width}:${v.height}`
        );
      } else {
        args.push('-vf', `scale=${v.width}:${v.height}`);
      }
      args.push(
        '-c:v', 'mjpeg',
        '-q:v', String(v.quality),
        '-f', 'image2pipe',
        'pipe:1'
      );
      return { cmd, args };
    }

    return { cmd, args: [] };
  }

  start() {
    const capture = this.resolveCapture();
    const { cmd, args } = this.buildFFmpegArgs(capture);
    console.log(`[broadcaster] Starting: ${cmd} ${args.join(' ')}`);

    this.process = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    this.process.stderr.on('data', (d) => process.stderr.write(d));

    this.process.stdout.on('data', (chunk) => {
      this.buf = Buffer.concat([this.buf, chunk]);

      while (this.buf.length >= 4) {
        const eoiIdx = this.buf.indexOf(EOI);
        if (eoiIdx === -1) break;

        const frameEnd = eoiIdx + 2;
        const soiIdx = this.buf.lastIndexOf(SOI, eoiIdx);
        if (soiIdx === -1) break;

        const frame = this.buf.slice(soiIdx, frameEnd);
        this.buf = this.buf.slice(frameEnd);

        this.emit('frame', frame);
      }
    });

    this.process.on('error', (err) => {
      console.error('[broadcaster] FFmpeg error:', err.message);
    });

    this.process.on('exit', (code) => {
      console.log(`[broadcaster] FFmpeg exited (code ${code})`);
      this.process = null;
    });
  }

  stop() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }

  isRunning() {
    return this.process !== null && this.process.exitCode === null;
  }
}

module.exports = { Broadcaster };
