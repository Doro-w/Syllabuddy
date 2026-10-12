# Syllabuddy

AI-assisted learning desktop application for Windows 10/11 x64.

Reads course materials (PDF, PPTX), provides AI explanations, personal annotations,
contextual Q&A, daily learning tasks, and progress tracking.

> Project specification: [`AGENTS.md`](AGENTS.md)

## Status

**Phase 0 (project foundation)** — a runnable desktop shell, build tooling, and CI are in
place. Feature phases 1–7 are planned but not yet implemented.

## Tech stack

- Tauri 2.x (desktop shell), React 19, TypeScript (strict), Vite
- pnpm as package manager
- Vitest + React Testing Library for tests
- ESLint + Prettier for static checks and formatting
- Rust (stable, `x86_64-pc-windows-msvc` toolchain) for the native layer

## Prerequisites

- Windows 10/11 x64
- Node.js 20+ and pnpm
- Rust toolchain (`rustup` with `stable-x86_64-pc-windows-msvc`)
- Visual Studio 2022 with C++ build tools
- WebView2 runtime (usually preinstalled on Windows 11)

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm tauri dev
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

## Build a Windows package

```bash
pnpm tauri build
```

Installers are written to `src-tauri/target/release/bundle/`.

## Project structure

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`AGENTS.md`](AGENTS.md) §6.
