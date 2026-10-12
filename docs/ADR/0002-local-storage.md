# ADR 0002: Local storage — SQLite

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

Documents, annotations, highlights, learning tasks, and conversations must persist across
restarts. The data is local-first and structured, with relationships between records.

## Decision

Use **SQLite** with foreign keys enabled for structured local data, and the local
filesystem for imported files and derived caches. Versioned migrations manage schema
evolution.

## Consequences

- Requires a maintained SQLite integration compatible with Tauri 2.
- The frontend must not access the database directly; access goes through application
  services over Tauri commands.
- Provider credentials must not be stored as plaintext in these tables (secure credential
  store or session-only fallback).
