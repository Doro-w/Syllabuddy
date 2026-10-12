# Architecture

This document summarizes the high-level architecture. The authoritative spec is
[`AGENTS.md`](../AGENTS.md); this file records the concrete layering decisions.

## Layers

```
React UI Layer            (src/app, src/features/*, src/components/*)
        │
Application Services      (src/features/*/services, src/services/*)
        │
Document Infrastructure   (src/features/documents/{adapters,parsers})
AI Provider Layer         (src/features/ai/{providers,registry,prompts,streaming})
        │
Persistence / Storage     (SQLite via src-tauri, local file storage)
```

## Key rules

1. UI components do not call provider APIs or SQL directly.
2. Document parsers do not depend on React components.
3. AI provider adapters do not depend on document viewer implementations.
4. Business services use repository interfaces, not hard-coded database access.
5. All AI requests go through a centralized context builder.
6. Native filesystem access follows Tauri capability/permission configuration.

## Current implementation state

Phase 0 foundation:

- `src/app/` — React entry point and root component.
- `src/shared/errors/` — shared application error model (`AppError`).
- `src/shared/types/` — document/page domain contracts (`PageReference`, `DocumentRecord`, `DocumentPage`).
- `src/shared/utils/` — page index conversion helpers with unit tests.
- `src/shared/constants/` — application constants.
- `src/components/`, `src/features/`, `src/services/` — directory skeleton reserved for
  Phases 1–6 (`.gitkeep` placeholders; populated as each phase's responsibilities become
  concrete per `AGENTS.md` §6 directory rules).
- `src-tauri/` — minimal Tauri shell (`main.rs`, `lib.rs`) with the default capability.
- `docs/ADR/` — architecture decision records.
