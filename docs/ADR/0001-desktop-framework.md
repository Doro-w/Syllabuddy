# ADR 0001: Desktop framework — Tauri 2

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

The application is a local-first Windows learning desktop app. It must ship a small
installer, run with minimal resource overhead, provide secure native filesystem and
database access, and host a modern web UI.

## Decision

Use **Tauri 2.x** as the desktop shell with **React + TypeScript + Vite** for the frontend.

## Consequences

- Rust is required for the native layer, adding a second toolchain.
- Native capabilities (filesystem, database) must be exposed through explicit Tauri
  commands and capabilities rather than direct frontend access.
- Smaller install size and memory footprint than Electron.
- WebView2 (system-provided on Windows 10/11) is used for rendering.
