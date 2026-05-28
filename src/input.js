const { execFile } = require('child_process');

function createInputHandler(config) {
  const { cmd, keydown, keyup, keyMap } = config.input;

  function sendKey(type, key) {
    const mapped = keyMap[key] || key;
    const args = type === 'keydown' ? keydown(mapped) : keyup(mapped);

    execFile(cmd, args, (err) => {
      if (err) {
        console.error(`[input] ${type} ${mapped} failed:`, err.message);
      }
    });
  }

  return sendKey;
}

module.exports = { createInputHandler };
