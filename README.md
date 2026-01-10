# port-audit

A TUI tool for managing TCP listening ports on macOS.

## Features

- List all TCP listening ports
- Real-time refresh (every 2 seconds)
- Search filter (by port number or process name)
- Kill processes (SIGTERM → SIGKILL)
- Tokyo Night theme

## Installation

```bash
bun install
```

## Usage

```bash
bun dev
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
