const { spawn } = require('child_process');
const { EventEmitter } = require('events');

const SOI = Buffer.from([0xFF, 0xD8]);
const EOI = Buffer.from([0xFF, 0xD9]);

class Broadcaster extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.process = null;
    this.buf = Buffer.alloc(0);
  }

  start() {
    const { cmd, args } = this.config.ffmpeg;
    console.log(`[broadcaster] Starting: ${cmd} ${args.join(' ')}`);

    this.process = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    this.process.stderr.on('data', (d) => process.stderr.write(d));

    this.process.stdout.on('data', (chunk) => {
      this.buf = Buffer.concat([this.buf, chunk]);

      while (this.buf.length >= 4) {
        // Find EOI marker (end of JPEG frame)
        const eoiIdx = this.buf.indexOf(EOI);
        if (eoiIdx === -1) break;

        const frameEnd = eoiIdx + 2;
        // Find SOI marker (start of this frame)
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
