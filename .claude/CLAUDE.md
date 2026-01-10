# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
bun install    # Install dependencies
bun dev        # Run with watch mode (hot reload)
```

## Architecture

This is a terminal UI (TUI) application built with OpenTUI and React 19.

**Entry point:** `src/index.tsx` - Creates a CLI renderer and mounts a React component tree to the terminal.

**Key components:**
- `<box>` - Flexbox-like container for layout
- `<text>` - Text display with attributes
- `<ascii-font>` - ASCII art text rendering

**Runtime:** Bun (no build step required - runs TypeScript directly)

## Tech Stack
- **OpenTUI** (`@opentui/core`, `@opentui/react`) - Terminal UI framework
- **React 19** - Component model with modern JSX transform
- **Bun** - JavaScript runtime and package manager
- **TypeScript** - Strict mode enabled

## Ref

- [OpenTUI Core](https://github.com/anomalyco/opentui/tree/main/packages/core)
- [OpenTUI React](https://github.com/anomalyco/opentui/tree/main/packages/react)
- [Bun](https://bun.sh/)
