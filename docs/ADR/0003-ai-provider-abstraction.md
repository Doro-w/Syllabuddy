# ADR 0003: AI provider abstraction

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

The application must support multiple AI providers and models without coupling the UI,
document parsing, or persistence to any single vendor.

## Decision

Define a provider-independent adapter interface (`AIProviderAdapter`) resolved by a
provider registry. Implement an OpenAI-compatible HTTP adapter first, with dedicated
adapters for incompatible APIs as needed.

## Consequences

- Business services depend on the adapter interface, not on a specific provider SDK.
- Provider errors are normalized to stable error codes (`AIServiceError`).
- Provider configuration and credentials are managed separately from business logic.
- Switching providers must not affect saved annotations, tasks, or conversation history.
