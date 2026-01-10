# port-audit

[![CI](https://github.com/hehehai/port-audit/actions/workflows/ci.yml/badge.svg)](https://github.com/hehehai/port-audit/actions/workflows/ci.yml)
[![Release](https://github.com/hehehai/port-audit/actions/workflows/release.yml/badge.svg)](https://github.com/hehehai/port-audit/actions/workflows/release.yml)

A TUI tool for managing TCP listening ports on macOS.

## Features

- List all TCP listening ports
- Real-time refresh (every 2 seconds)
- Search filter (by port number or process name)
- Kill processes (SIGTERM → SIGKILL)
- Tokyo Night theme

## Requirements

- [Bun](https://bun.sh) runtime (development only)

## Installation

Homebrew:

```bash
brew install hehehai/tap/port-audit
```

No Bun runtime is required for the prebuilt binary.

npm:

```bash
npm i -g @hehehai/port-audit
```

macOS only. The npm package ships a prebuilt binary.

GitHub Packages:

```bash
npm config set @hehehai:registry https://npm.pkg.github.com
npm i -g @hehehai/port-audit
```

GitHub Release (macOS binary):

```bash
curl -L -o port-audit.tar.gz https://github.com/hehehai/port-audit/releases/download/vX.Y.Z/port-audit-vX.Y.Z-macos.tar.gz
tar -xzf port-audit.tar.gz
./port --help
```

GitHub Release (Linux binary):

```bash
curl -L -o port-audit.tar.gz https://github.com/hehehai/port-audit/releases/download/vX.Y.Z/port-audit-vX.Y.Z-linux.tar.gz
tar -xzf port-audit.tar.gz
./port --help
```

GitHub Release (Windows binary):

```powershell
curl -L -o port-audit.tar.gz https://github.com/hehehai/port-audit/releases/download/vX.Y.Z/port-audit-vX.Y.Z-windows.tar.gz
tar -xzf port-audit.tar.gz
.\port.exe --help
```

From source:

```bash
bun install
bun link
```

One-line installer:

```bash
curl -fsSL https://raw.githubusercontent.com/hehehai/port-audit/main/scripts/install.sh | sh
```

## Usage

```bash
port
```

For development:

```bash
bun run dev:tui
```

Lint:

```bash
bun run lint
```

Test:

```bash
bun run test
```

## CLI

```bash
port --help
port list
port list -s 3001
port k 3001
```

Dev CLI:

```bash
bun run cli -- --help
```

## Keybindings

| Key | Action |
|---|---|
| `↑/k` | Move up |
| `↓/j` | Move down |
| `/` | Search |
| `esc` | Exit search |
| `x/Enter` | Kill process |
| `r` | Refresh |
| `q` | Quit |

## Tech Stack

- [OpenTUI](https://opentui.dev) - Terminal UI framework
- React 19
- Bun

## Release Automation

GitHub Actions publishes on tags like `v0.1.0`.
Releases include macOS/Linux/Windows binary tarballs used for direct installs.

Required secrets:

- `NPM_TOKEN` for npm publish
- `HOMEBREW_TOKEN` for Homebrew tap updates
- `HOMEBREW_TAP` (e.g. `hehehai/tap`)
- `HOMEBREW_FORMULA` (e.g. `port-audit`)
- `GITHUB_TOKEN` is used automatically for GitHub Packages publish
