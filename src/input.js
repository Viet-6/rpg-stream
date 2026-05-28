const { spawn, execFile } = require('child_process');

function createInputHandler(config) {
  const { cmd, keydownCmd, keyupCmd, keyMap } = config.input;
  const held = {};

  // Linux: keep xdotool alive, write to stdin
  // Windows: execFile PowerShell per event
  const isXdotool = cmd === 'xdotool';
  let proc = null;

  function ensureProc() {
    if (isXdotool) {
      if (proc && proc.stdin.writable && proc.exitCode === null) return;
      proc = spawn(cmd, ['-']);
      proc.stderr.on('data', () => {});
      proc.on('error', (err) => {
        console.error('[input] xdotool error:', err.message);
        proc = null;
      });
      proc.on('exit', () => { proc = null; });
    }
  }

  function sendKey(type, key) {
    const mapped = keyMap[key] || key;

    if (type === 'keydown' && held[key]) return;
    if (type === 'keyup' && !held[key]) return;
    if (type === 'keydown' || type === 'keyup') {
      held[key] = type === 'keydown';
    }

    let cmdStr;
    if (type === 'press') {
      cmdStr = config.input.keypressCmd(mapped);
    } else {
      cmdStr = type === 'keydown' ? keydownCmd(mapped) : keyupCmd(mapped);
    }

    if (isXdotool) {
      ensureProc();
      try { proc.stdin.write(cmdStr + '\n'); } catch (e) {}
    } else {
      execFile(cmd, ['-Command', cmdStr], () => {});
    }
  }

  return sendKey;
}

module.exports = { createInputHandler };
