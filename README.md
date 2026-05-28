# RPG Stream — Setup Guide

Stream your laptop screen to your phone browser with touch controls for RPG Maker games.

## Quick Start

```bash
# 1. Install dependencies
## Linux (Ubuntu/Debian)
sudo apt install ffmpeg xdotool
## Linux (Arch)
sudo pacman -S ffmpeg xdotool
## Windows
# Install ffmpeg from https://ffmpeg.org/download.html and add to PATH

# 2. Start the server
cd rpg-stream
npm start

# 3. Open from your phone
# Open http://YOUR_LAN_IP:3000 in your phone browser
# Find your LAN IP with: ip addr (Linux) or ipconfig (Windows)
```

## Requirements

| Component | Linux | Windows |
|-----------|-------|---------|
| Node.js | v16+ | v16+ |
| ffmpeg | Required | Required |
| xdotool | Required | Not needed |
| PowerShell | Not needed | Built-in |

## Installation

### Node.js

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
```

**Windows:**
Download from https://nodejs.org/ and install.

### FFmpeg

**Linux (Ubuntu/Debian):**
```bash
sudo apt install ffmpeg
```

**Linux (Arch):**
```bash
sudo pacman -S ffmpeg
```

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH
4. Verify: open Command Prompt and run `ffmpeg -version`

### xdotool (Linux only)

**Ubuntu/Debian:**
```bash
sudo apt install xdotool
```

**Arch:**
```bash
sudo pacman -S xdotool
```

## Verify Installation

```bash
ffmpeg -version
node --version
npm --version
```

## Launch

```bash
cd rpg-stream
npm install
npm start
```

You should see:
```
[server] http://0.0.0.0:3000
```

## Connect from Phone

1. Find your laptop's LAN IP:
   - **Linux**: `ip addr` or `hostname -I`
   - **Windows**: `ipconfig` (look for "IPv4 Address")
2. On your phone (same WiFi network), open: `http://YOUR_IP:3000`
3. The touch overlay appears automatically

## Configuration

Set environment variables before running `npm start`:

### Video

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Bind address |
| `VIDEO_WIDTH` | `800` | Output stream width |
| `VIDEO_HEIGHT` | `600` | Output stream height |
| `VIDEO_FPS` | `10` | Frames per second |
| `VIDEO_QUALITY` | `2` | JPEG quality (1=best, 31=worst) |
| `DISPLAY` | `:0.0` | Linux X display |

### Capture Region

By default the full screen is captured and scaled to the stream size. Use these options to capture only a specific area (e.g. a game window):

| Variable | Default | Description |
|----------|---------|-------------|
| `CAPTURE_MODE` | `fullscreen` | Capture mode: `fullscreen`, `region`, or `window` |
| `CAPTURE_X` | `0` | Left offset of capture region (region mode) |
| `CAPTURE_Y` | `0` | Top offset of capture region (region mode) |
| `CAPTURE_WIDTH` | `VIDEO_WIDTH` | Width of capture region (region mode) |
| `CAPTURE_HEIGHT` | `VIDEO_HEIGHT` | Height of capture region (region mode) |
| `CAPTURE_WINDOW` | — | Window title pattern for auto-detection (window mode, Linux only) |

Examples:

```bash
# Capture a 544x416 game at the top-left corner
CAPTURE_MODE=region CAPTURE_WIDTH=544 CAPTURE_HEIGHT=416 npm start

# Auto-detect a window containing "Game" in its title
CAPTURE_MODE=window CAPTURE_WINDOW="Game" npm start

# Stream at native 544x416 resolution (no scaling)
VIDEO_WIDTH=544 VIDEO_HEIGHT=416 CAPTURE_MODE=region CAPTURE_WIDTH=544 CAPTURE_HEIGHT=416 npm start
```

To find your game window title (Linux):
```bash
xdotool search --name "" | while read id; do xdotool getwindowname "$id"; done
```

## Troubleshooting

**"ffmpeg not found"**
→ Install ffmpeg and verify with `ffmpeg -version`

**"xdotool not found"** (Linux)
→ Install xdotool: `sudo apt install xdotool`

**Blank screen on phone**
→ Check the server terminal for FFmpeg errors
→ Make sure `DISPLAY` is correct (try `:1.0` instead of `:0.0`)
→ Verify firewall allows port 3000

**Input not working**
→ Linux: ensure xdotool is installed
→ Linux: make sure the game window has focus (click it first)
→ Windows: PowerShell should work out of the box

**Laggy video**
→ Reduce quality: `VIDEO_QUALITY=5 npm start`
→ Reduce resolution: `VIDEO_WIDTH=640 VIDEO_HEIGHT=480 npm start`
→ Reduce FPS: `VIDEO_FPS=5 npm start`