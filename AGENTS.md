# AGENTS.md

# AI Learning Desktop — Project Development Specification

> **Project type:** Windows desktop learning application
> **Project status:** Initial specification / MVP planning
> **Primary language:** TypeScript
> **Primary UI language:** English-compatible i18n, initial interface may use Chinese
> **Architecture:** Local-first desktop application with pluggable AI providers
> **Target platform:** Windows 10/11 x64
> **Specification version:** 0.1.0

## 1. Project Overview

### 1.1 Product Vision

Build an AI-assisted learning desktop application that integrates course material reading, AI explanations, personal annotations, contextual Q&A, daily learning tasks, and learning progress tracking.

The application should allow users to upload course slides, textbooks, PDFs, and other learning materials, then interact with those materials through a unified reading and learning workspace.

### 1.2 Core Features

1. **AI Daily Learning Plan**
   - Generate daily learning tasks based on user goals, uploaded references, and learning progress.
   - Allow users to create, edit, complete, postpone, and delete tasks.
   - Link tasks to specific documents, chapters, and pages.
   - Track completion status and study history.
2. **Document Reading and AI Explanation**
   - Import PDF and PPTX files.
   - Display the original document in the left reading panel.
   - Extract and explain important content page by page.
   - Display AI-generated notes in the right annotation panel.
   - Allow users to edit, supplement, regenerate, and delete AI-generated notes.
3. **Personal Annotations and Highlights**
   - Create manual notes associated with a document and page.
   - Highlight text in supported document formats.
   - Support multiple highlight colors.
   - Persist annotations and highlights across application restarts.
   - Preserve user-edited content when AI content is regenerated.
4. **Context-Aware AI Chat**
   - Provide a persistent chat input at the bottom of the workspace.
   - Include the current document, current page, selected text, and relevant notes in the AI request.
   - Allow follow-up questions with conversation history.
   - Support streaming responses where the selected provider allows it.
5. **Selection-Based AI Questions**
   - Allow users to select a word, sentence, or paragraph and ask AI about it.
   - Support actions such as Explain, Translate, Summarize, Give an Example, and Ask a Custom Question.
   - Preserve the original selection and its page reference in the conversation context.
6. **Configurable AI Providers**
   - Support switching between configured AI providers and models.
   - Support provider-specific API base URLs and authentication.
   - Separate provider configuration from business logic.
   - Display connection status and meaningful error messages.
   - Never expose API keys in application logs or frontend error messages.

### 1.3 Non-Goals for the Initial MVP

- Real-time collaborative editing.
- Cloud synchronization across devices.
- Full support for every document format.
- Automatic reconstruction of all PowerPoint layouts.
- Autonomous web browsing or external research.
- Mandatory local LLM inference.
- Complex multi-agent orchestration.

These capabilities may be introduced after the core learning workflow is stable.

## 2. Development Principles

All AI coding agents must follow these principles.

### 2.1 Local-First

- User documents and annotations are stored locally by default.
- External AI providers receive only the information required for the current request.
- Never upload an entire document automatically when page-level or selection-level context is sufficient.
- Make external data transmission explicit and configurable.

### 2.2 Separation of Concerns

Keep UI components, document parsing, persistence, AI orchestration, and provider integrations independent.

A provider change must not require modifications to the PDF viewer, annotation model, or learning-task implementation.

### 2.3 Data Ownership

Distinguish the following data types:

- Original document content.
- AI-generated explanations.
- User-created notes.
- User-edited AI notes.
- Text highlights.
- Learning tasks.
- AI conversation history.

AI regeneration must never silently overwrite user-owned content.

### 2.4 Traceability

Every document-related object should be traceable to its source whenever possible.

Use stable document IDs, page indexes, source text, and location metadata rather than relying exclusively on rendered coordinates.

### 2.5 Incremental Delivery

Implement one complete, testable workflow at a time.

Do not implement all UI screens with mocked behavior and postpone persistence, error handling, or core interaction logic until the end.

### 2.6 Type Safety

- Enable TypeScript strict mode.
- Define shared interfaces before implementing cross-module functionality.
- Validate external API responses and persisted configuration at runtime.
- Avoid `any` unless explicitly justified.

## 3. Recommended Technology Stack

### 3.1 Desktop and Frontend

- Tauri 2.x: desktop shell and native integration.
- React: UI component framework.
- TypeScript: application language.
- Vite: development server and frontend build.
- A maintained component library: accessible controls, menus, dialogs, and forms.
- CSS Modules or a consistent utility-CSS system: styling.
- Zustand or an equivalent lightweight state store: shared workspace state.
- TanStack Query where asynchronous server-state management is beneficial.

Do not introduce multiple state-management libraries without a concrete need.

### 3.2 Document Processing

- PDF.js: PDF rendering, text layers, page navigation, and text selection.
- PPTX parser based on OOXML/ZIP processing: extract slide text, slide order, and supported structural metadata.
- A document abstraction layer: unify page navigation and text-selection events.
- OCR: optional future capability for scanned PDFs and image-based slides.

For the initial release, prioritize searchable PDFs and text-based PPTX files.

### 3.3 Persistence

- SQLite: structured local data.
- A maintained SQLite integration compatible with Tauri 2 and its security model.
- Local filesystem: imported files and optional cached derivatives.
- Versioned database migrations: schema evolution.

The frontend must not access arbitrary local paths or execute native commands directly. File access must go through explicitly permitted desktop APIs or application services.

### 3.4 AI Integration

- Provider-independent AI service interface.
- OpenAI-compatible HTTP adapter where supported.
- Dedicated adapters for providers with incompatible APIs.
- Streaming responses using SSE or the provider's documented streaming protocol.
- Runtime request and response validation.
- Configurable timeout, cancellation, and retry behavior.

Use official SDKs when their runtime requirements are compatible with the application. Otherwise, use a small, tested HTTP adapter.

### 3.5 Testing and Tooling

- Vitest: unit and integration tests.
- React Testing Library: UI behavior tests.
- Playwright or an equivalent supported approach: end-to-end tests.
- ESLint and Prettier: static checks and formatting.
- Rust tests: native desktop logic where applicable.
- CI: type checking, linting, tests, and build verification.

Pin dependencies and commit the package-manager lockfile.

## 4. High-Level Architecture

```
┌────────────────────────────────────────────────────┐
│                  React UI Layer                    │
│                                                    │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Task Panel  │  │ Document     │  │ Annotation│  │
│  │             │  │ Workspace    │  │ Panel     │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│                                                    │
│              Bottom Contextual AI Chat             │
└────────────────────────┬───────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────┐
│                 Application Services               │
│                                                    │
│ WorkspaceService    DocumentService                │
│ AnnotationService   LearningPlanService            │
│ ChatService         SearchService                  │
│ SettingsService     ExportService                  │
└──────────────┬──────────────────────┬──────────────┘
               │                      │
┌──────────────▼──────────┐ ┌─────────▼─────────────┐
│ Document Infrastructure │ │ AI Provider Layer     │
│                         │ │                       │
│ PDF Adapter             │ │ Provider Registry     │
│ PPTX Adapter            │ │ Provider Adapters     │
│ Text Extraction         │ │ Prompt Builder        │
│ Page Indexing           │ │ Streaming / Errors    │
└──────────────┬──────────┘ └─────────┬─────────────┘
               │                      │
┌──────────────▼──────────────────────▼─────────────┐
│              Persistence / Storage                │
│                                                   │
│ SQLite Database + Local File Storage              │
└───────────────────────────────────────────────────┘
```

### Architecture Rules

1. UI components must not call provider APIs directly.
2. UI components must not execute SQL directly.
3. Document parsers must not depend on React components.
4. AI provider adapters must not depend on document viewer implementations.
5. Business services must use repository interfaces rather than hard-coded database access.
6. All AI requests must be constructed through a centralized context builder.
7. All document-related AI operations must use a common page-reference model.
8. Native filesystem access must follow the application's Tauri capability and permission configuration.

## 5. UI and Interaction Specification

### 5.1 Main Workspace

The main screen contains three persistent areas.

```
┌───────────────────────────────────────────────────────────┐
│ Toolbar: Workspace | Open File | Search | AI Provider     │
├────────────────┬──────────────────────────┬───────────────┤
│                │                          │               │
│ Left Sidebar   │ Main Document Viewer     │ Right Sidebar │
│                │                          │               │
│ Daily Tasks    │ PDF / PPTX Page Content  │ AI Notes      │
│                │                          │ User Notes    │
│ File Library   │ Page Navigation          │ Highlights    │
│                │                          │               │
│ Document List  │ Text Selection / Q&A     │ Edit / Save   │
│                │                          │               │
├────────────────┴──────────────────────────┴───────────────┤
│ Bottom AI Chat: Current Document + Page + Selected Text   │
└───────────────────────────────────────────────────────────┘
```

The left sidebar should support switching between:

- Daily learning tasks.
- Imported document library.
- Document outline or page navigation, when applicable.

The right sidebar should support:

- AI-generated page explanations.
- User notes and manual annotations.
- Highlight management.
- Editing and regenerating AI content.

The workspace must support resizable panels and remember reasonable layout preferences.

### 5.2 Reader and Page Context

Maintain a single authoritative workspace context.

```
type DocumentType = "pdf" | "pptx";

interface PageReference {
  documentId: string;
  documentType: DocumentType;
  pageIndex: number;       // Zero-based internal index
  displayPageNumber: number; // One-based visible number
  sourcePageLabel?: string;
}

interface TextSelection {
  page: PageReference;
  text: string;
  startOffset?: number;
  endOffset?: number;
  anchor?: SelectionAnchor;
}
```

Rules:

- `pageIndex` is zero-based internally.
- `displayPageNumber` is one-based for user display.
- PDF page numbers and PPTX slide numbers must never be silently mixed.
- A page change must update the current workspace context.
- The bottom chat must use the current context at the moment the user submits a message.
- If a request refers to a selected passage, preserve the passage's page reference.
- A selection from an inactive document must not accidentally be used in a new request.

### 5.3 Document Navigation

Required controls:

- Previous page / next page.
- Direct page-number navigation.
- Current page and total page count.
- Zoom in / zoom out / fit-to-width where supported.
- Document outline or slide list when available.
- Search within the current document.
- Clear indication of the active document.

Page navigation events must update the workspace state and the active AI context.

### 5.4 Selection-Based Q&A

When a user selects text, show a compact contextual action menu.

Initial actions:

- Explain this.
- Translate.
- Summarize.
- Give an example.
- Ask AI.

The generated request must contain the selected text and its page reference.

If selection metadata is unavailable, fall back to selected text plus the current page reference. Never fabricate precise source offsets.

### 5.5 Highlights

Both the reading area and the annotation area must support highlighting where technically applicable.

For PDF text, use text-layer ranges and persistent text anchors.

For PPTX, initially support extracted text selections. More advanced shape-level anchoring can be added later.

A highlight should contain:

- Stable ID.
- Document ID.
- Page reference.
- Selected text.
- Color.
- Source location metadata where available.
- Created and updated timestamps.

For non-text regions, image-only content, or unstable anchors, provide a manual note or region-annotation fallback instead of promising exact text highlighting.

### 5.6 AI Annotation Editing

Every AI-generated annotation must provide:

- View.
- Edit.
- Save.
- Cancel.
- Regenerate.
- Delete or archive, subject to ownership rules.

Store AI-generated content separately from user-edited content.

Recommended fields:

- `generatedContent`: original AI output.
- `userContent`: optional user-edited version.
- `contentRevision`: current revision.
- `generationStatus`: generation lifecycle state.

The displayed content should use `userContent` when present; otherwise, use `generatedContent`.

Regeneration must require an explicit user action and must preserve existing user edits. A regeneration may create a new revision or a draft for comparison.

## 6. Repository Directory Structure

Use a modular monorepo structure, but avoid unnecessary package splitting in the initial release.

```
ai-learning-desktop/
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── .env.example
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── API_CONTRACTS.md
│   ├── AI_PROVIDER_CONTRACT.md
│   ├── DOCUMENT_PROCESSING.md
│   ├── SECURITY.md
│   ├── ADR/
│   │   ├── 0001-desktop-framework.md
│   │   ├── 0002-local-storage.md
│   │   └── 0003-ai-provider-abstraction.md
│   └── roadmap/
│       └── MVP.md
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── toolbar/
│   │   ├── dialogs/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── workspace/
│   │   │   ├── components/
│   │   │   ├── state/
│   │   │   └── types.ts
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── documents/
│   │   │   ├── components/
│   │   │   ├── adapters/
│   │   │   ├── parsers/
│   │   │   ├── services/
│   │   │   ├── anchors/
│   │   │   └── types.ts
│   │   ├── annotations/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── context/
│   │   │   └── types.ts
│   │   ├── ai/
│   │   │   ├── providers/
│   │   │   ├── registry/
│   │   │   ├── prompts/
│   │   │   ├── streaming/
│   │   │   └── types.ts
│   │   ├── search/
│   │   └── settings/
│   │
│   ├── services/
│   │   ├── database/
│   │   ├── filesystem/
│   │   ├── logging/
│   │   └── events/
│   │
│   ├── shared/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── validation/
│   │   └── errors/
│   │
│   └── styles/
│
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   ├── migrations/
│   ├── icons/
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       ├── commands/
│       └── services/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── fixtures/
│   └── e2e/
│
└── scripts/
    ├── check-environment.*
    └── package-release.*
```

### Directory Rules

- `features/` contains feature-specific UI, state, services, and types.
- `shared/` contains reusable code without feature-specific business rules.
- `src-tauri/` contains native capabilities, secure filesystem operations, and database integration where applicable.
- `docs/ADR/` records architecture decisions that are expensive to reverse.
- Tests should mirror the application modules where practical.
- Do not place all business logic in React components.
- Do not create empty modules solely to imitate the proposed structure; introduce files when their responsibilities become concrete.

## 7. Domain Model and Data Contracts

Use UUIDs or another collision-resistant stable identifier for persisted entities.

All persisted timestamps should use UTC ISO 8601 strings or a consistently defined integer representation. Convert them to local time only for display and date-based scheduling.

### 7.1 Documents

```
interface DocumentRecord {
  id: string;
  title: string;
  documentType: "pdf" | "pptx";
  originalFileName: string;
  storagePath: string;
  contentHash: string;
  pageCount: number;
  importedAt: string;
  updatedAt: string;
  parsingStatus: "pending" | "processing" | "ready" | "failed";
}
```

`storagePath` is an internal local path, not a path that should be exposed indiscriminately to UI components or remote providers.

### 7.2 Page Content

```
interface DocumentPage {
  documentId: string;
  pageIndex: number;
  displayPageNumber: number;
  textContent: string;
  contentHash: string;
  extractionStatus: "pending" | "ready" | "failed";
}
```

Store extracted text independently from rendered pages so that AI requests do not require re-rendering the document.

### 7.3 Annotations

```
type AnnotationKind =
  | "ai_explanation"
  | "user_note"
  | "highlight_note";

interface AnnotationRecord {
  id: string;
  documentId: string;
  pageIndex: number;
  kind: AnnotationKind;
  title?: string;
  generatedContent?: string;
  userContent?: string;
  contentRevision: number;
  generationStatus?: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}
```

AI generation status and user-edit status should be modeled separately if the UI needs to represent them independently.

### 7.4 Highlights

```
interface SelectionAnchor {
  startOffset?: number;
  endOffset?: number;
  exactText: string;
  prefix?: string;
  suffix?: string;
  quoteHash?: string;
  rects?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface HighlightRecord {
  id: string;
  documentId: string;
  pageIndex: number;
  selectedText: string;
  color: string;
  anchor: SelectionAnchor;
  createdAt: string;
  updatedAt: string;
}
```

Coordinates must specify their coordinate space in the implementation contract. Do not treat viewport pixels as permanent document coordinates.

### 7.5 Learning Tasks

```
type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "postponed";

interface LearningTask {
  id: string;
  title: string;
  description?: string;
  documentId?: string;
  pageIndex?: number;
  scheduledDate: string;
  estimatedMinutes?: number;
  status: TaskStatus;
  source: "ai_generated" | "user_created";
  createdAt: string;
  updatedAt: string;
}
```

### 7.6 Conversations

```
interface ChatMessage {
  id: string;
  conversationId: string;
  role: "system" | "user" | "assistant";
  content: string;
  pageReference?: PageReference;
  selectedText?: string;
  status: "pending" | "streaming" | "completed" | "failed";
  createdAt: string;
}

interface ConversationRecord {
  id: string;
  title: string;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
}
```

Provider credentials and private API configuration must not be stored in conversation messages.

## 8. Service Interfaces

Interfaces in this section define application-level contracts. Implementations may use different internal mechanisms but must preserve observable behavior.

### 8.1 Document Service

```
interface DocumentService {
  importFile(filePath: string): Promise<DocumentRecord>;

  getDocument(documentId: string): Promise<DocumentRecord | null>;

  getPage(
    documentId: string,
    pageIndex: number
  ): Promise<DocumentPage>;

  getPageCount(documentId: string): Promise<number>;

  extractText(
    page: PageReference
  ): Promise<string>;

  searchText(
    documentId: string,
    query: string
  ): Promise<Array<{
    pageIndex: number;
    excerpt: string;
  }>>;

  removeDocument(documentId: string): Promise<void>;
}
```

Requirements:

- Validate file type and file accessibility.
- Reject unsupported or malformed documents with actionable errors.
- Avoid duplicate imports when content hashes match, unless the user explicitly requests a separate copy.
- Do not delete original files unless the user explicitly confirms that action.
- Treat document page indexes as zero-based.

### 8.2 Annotation Service

```
interface AnnotationService {
  listByPage(
    documentId: string,
    pageIndex: number
  ): Promise<AnnotationRecord[]>;

  create(
    input: Omit<AnnotationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<AnnotationRecord>;

  update(
    id: string,
    patch: Partial<Pick<
      AnnotationRecord,
      "title" | "userContent" | "contentRevision"
    >>
  ): Promise<AnnotationRecord>;

  createHighlight(
    input: Omit<HighlightRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<HighlightRecord>;

  updateHighlight(
    id: string,
    patch: Partial<Pick<HighlightRecord, "color" | "anchor">>
  ): Promise<HighlightRecord>;

  delete(id: string): Promise<void>;
}
```

Production implementations must validate allowed fields and use transactions when related records must change together.

Do not expose unrestricted database update operations to UI components.

### 8.3 Learning Plan Service

```
interface LearningPlanService {
  listTasks(date: string): Promise<LearningTask[]>;

  createTask(
    input: Omit<LearningTask, "id" | "createdAt" | "updatedAt">
  ): Promise<LearningTask>;

  updateTask(
    id: string,
    patch: Partial<Pick<
      LearningTask,
      "title" | "description" | "scheduledDate" |
      "estimatedMinutes" | "status" | "documentId" | "pageIndex"
    >>
  ): Promise<LearningTask>;

  generateDailyPlan(
    input: DailyPlanRequest
  ): Promise<LearningTask[]>;
}
```

Daily plan generation must return structured task data, not arbitrary text that the UI attempts to parse.

### 8.4 Chat Service

```
interface ChatRequest {
  conversationId: string;
  message: string;
  context: AIContext;
  providerId?: string;
  modelId?: string;
}

interface AIContext {
  document?: {
    documentId: string;
    title: string;
    documentType: "pdf" | "pptx";
  };

  currentPage?: PageReference;

  selectedText?: {
    text: string;
    page: PageReference;
    anchor?: SelectionAnchor;
  };

  pageText?: string;

  relevantAnnotations?: Array<{
    id: string;
    title?: string;
    content: string;
    pageIndex: number;
  }>;
}
```

Expose streaming and non-streaming APIs through the application service.

```
interface ChatService {
  sendMessage(
    request: ChatRequest,
    options?: { signal?: AbortSignal }
  ): Promise<ChatMessage>;

  streamMessage(
    request: ChatRequest,
    options?: { signal?: AbortSignal }
  ): AsyncIterable<ChatStreamEvent>;
}
```

The implementation must not blindly attach an entire document to every request.

Use a context builder to select relevant content based on the active page, selected text, and the user's explicit question.

## 9. AI Provider Contract

### 9.1 Provider Configuration

```
interface AIProviderConfig {
  id: string;
  name: string;

  kind: "openai_compatible" | "custom";

  baseUrl: string;
  defaultModel: string;

  enabled: boolean;

  capabilities: {
    chat: boolean;
    streaming: boolean;
    structuredOutput: boolean;
    embeddings: boolean;
  };

  timeoutMs: number;
}
```

Credentials must be managed separately.

```
interface ProviderCredentialReference {
  providerId: string;
  credentialKey: string;
  storage: "os_secure_store" | "session_only";
}
```

Use a supported Windows secure credential store or an appropriately protected operating-system credential mechanism where feasible. Never commit secrets to source control or store raw API keys in ordinary application configuration files.

For providers that cannot support the required secure storage mechanism, document the limitations and offer session-only credentials as a fallback.

### 9.2 Provider Adapter

```
interface AIProviderAdapter {
  readonly providerId: string;

  listModels(): Promise<Array<{
    id: string;
    displayName: string;
    capabilities: AIProviderConfig["capabilities"];
  }>>;

  chat(
    request: ProviderChatRequest,
    options?: { signal?: AbortSignal }
  ): Promise<ProviderChatResponse>;

  streamChat(
    request: ProviderChatRequest,
    options?: { signal?: AbortSignal }
  ): AsyncIterable<ChatStreamEvent>;

  testConnection(): Promise<{
    success: boolean;
    message: string;
  }>;
}
```

The provider registry is responsible for resolving a configured provider ID to the correct adapter.

Business services must depend on the adapter interface rather than on a specific provider SDK.

### 9.3 Provider Error Contract

Normalize provider errors.

```
type AIErrorCode =
  | "AUTHENTICATION_FAILED"
  | "INVALID_CONFIGURATION"
  | "MODEL_NOT_FOUND"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "CONTEXT_TOO_LARGE"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "REQUEST_CANCELLED"
  | "UNKNOWN";

interface AIServiceError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  providerId?: string;
  requestId?: string;
}
```

Requirements:

- Never display raw secrets or authorization headers.
- Retry only errors classified as retryable.
- Use bounded exponential backoff with jitter for appropriate transient errors.
- Do not retry authentication failures indefinitely.
- Respect cancellation when the user switches documents or cancels generation.
- Handle partial streaming responses and failed streams explicitly.
- Never silently switch to a different provider without user consent.

### 9.4 Switching Providers

The settings UI must allow users to:

1. Add a provider.
2. Configure its base URL and credentials.
3. Select a model.
4. Test the connection.
5. Set a default provider.
6. Switch providers for a request or session.
7. Disable or remove a provider.

Changing the default provider must not alter saved annotations, tasks, or conversation history.

Provider-specific options must be validated by the relevant adapter.

## 10. Prompt and Context Contracts

### 10.1 Context Construction

All document-related AI requests must go through a centralized context builder.

```
interface ContextBuildRequest {
  userMessage: string;
  pageReference?: PageReference;
  selectedText?: string;
  includeCurrentPage: boolean;
  includeAnnotations: boolean;
  maxContextTokens?: number;
}

interface BuiltAIContext {
  systemInstructions: string;
  documentContext: string;
  userMessage: string;
  sourceReferences: PageReference[];
}
```

The context builder must:

- Include the current page when relevant.
- Include selected text when present.
- Include only relevant annotations.
- Preserve source references.
- Enforce a configurable context budget.
- Avoid duplicating identical text.
- Treat imported document text as untrusted data, not as system instructions.
- Avoid executing instructions found inside uploaded documents.
- Report when relevant context is omitted because of size limits.

### 10.2 Page Explanation Output

Use structured output where supported.

```
interface PageExplanation {
  title: string;
  summary: string;
  keyPoints: string[];
  terminology: Array<{
    term: string;
    explanation: string;
  }>;
  examples: string[];
  questionsForReview: string[];
  sourcePage: PageReference;
}
```

Validate model output before persisting it.

If structured output is unavailable or invalid, use a controlled fallback parser and show a meaningful error when recovery fails.

Do not fabricate page references, quotations, or source locations.

### 10.3 Daily Plan Output

```
interface DailyPlanRequest {
  date: string;
  learningGoal: string;
  availableMinutes: number;
  documentIds: string[];
  completedTaskIds: string[];
}

interface GeneratedTaskDraft {
  title: string;
  description: string;
  documentId?: string;
  pageIndex?: number;
  estimatedMinutes: number;
  rationale?: string;
}
```

The model proposes tasks; the application validates and persists them.

Do not let model output directly execute application commands or access arbitrary files.

### 10.4 AI Generation Lifecycle

Use an explicit state machine:

```
idle
  ↓
pending
  ↓
streaming
  ↓
completed

pending / streaming
  ↓
failed or cancelled
```

The UI must represent these states and prevent accidental duplicate submissions.

For page explanations, save completed output as a new revision. Do not overwrite a user-edited note without an explicit confirmation or comparison workflow.

## 11. Database and Migration Requirements

Use SQLite with foreign keys enabled.

Recommended initial tables:

- `documents`
- `document_pages`
- `annotations`
- `highlights`
- `learning_tasks`
- `conversations`
- `chat_messages`
- `ai_providers`
- `app_settings`
- `schema_migrations`

Provider credentials must not be stored as plaintext in these tables.

Requirements:

1. Define primary keys and foreign keys.
2. Add indexes for frequent document/page lookups.
3. Use transactions for multi-record operations.
4. Create versioned migrations.
5. Test fresh installation and migration from the previous schema.
6. Define document deletion and related-record cleanup behavior.
7. Keep a clear distinction between deleting a database reference and deleting an original file.
8. Add backup/export mechanisms before introducing destructive migrations.

Recommended unique constraints include:

- `(document_id, page_index)` for document pages.
- A stable task ID for each task.
- A stable annotation ID for each annotation.
- A stable conversation ID and message ID for conversation data.

Do not use filenames as primary keys.

## 12. Configuration Contract

### 12.1 Configuration Categories

Separate configuration into four categories:

1. Build-time configuration.
2. Runtime application settings.
3. AI provider settings.
4. Secret credentials.

Example non-secret configuration:

```
{
  "app": {
    "name": "AI Learning Desktop",
    "locale": "en-GB",
    "theme": "system"
  },
  "workspace": {
    "leftPanelWidth": 280,
    "rightPanelWidth": 340,
    "showDailyTasks": true,
    "showAnnotations": true
  },
  "ai": {
    "defaultProviderId": null,
    "defaultModelId": null,
    "requestTimeoutMs": 60000,
    "maxContextTokens": 12000,
    "streamingEnabled": true
  },
  "documents": {
    "defaultZoom": "fit-width",
    "rememberLastPage": true
  }
}
```

This is an illustrative configuration contract, not a committed secrets file.

Validate all persisted settings at runtime. Apply safe defaults when optional settings are missing.

### 12.2 Environment Variables

Use `.env.example` only for non-secret development configuration, such as:

```
VITE_APP_NAME=AI Learning Desktop
```

Do not assume that environment variables used by Vite are secret. Values exposed to frontend code may become part of the application bundle.

Production API keys must not be embedded into the frontend build.

### 12.3 Configuration Migration

- Add a configuration version.
- Validate settings when loading.
- Migrate older versions explicitly.
- Preserve valid user settings across upgrades.
- Reject malformed provider configurations with actionable messages.

## 13. Security and Privacy Requirements

1. Use explicit Tauri capabilities and a minimal permission set.
2. Do not expose arbitrary shell execution to the frontend.
3. Validate imported file types, sizes, and parser results.
4. Guard against malformed PDFs, malicious document payloads, and path traversal.
5. Prevent prompt injection from uploaded document content.
6. Avoid loading untrusted remote content into privileged application contexts.
7. Never log API keys, authorization headers, or full credentials.
8. Avoid sending unrelated documents or private notes to AI providers.
9. Clearly identify when external services receive user content.
10. Provide a way to remove imported document records and associated local data.
11. Document what deletion means for original files, caches, and provider-side data.
12. Avoid retaining sensitive request content in diagnostic logs by default.
13. Restrict database and filesystem operations to approved service boundaries.
14. Treat AI output as untrusted content when rendering Markdown or links.

The application must not claim that data is private, encrypted, or deleted from external providers unless that behavior has been implemented and verified.

## 14. Error Handling and Observability

Define user-friendly error messages for:

- Unsupported file type.
- File import failure.
- Document parsing failure.
- Missing or inaccessible source file.
- Invalid API credentials.
- Provider connection failure.
- Model not found.
- Rate limit exceeded.
- Network timeout.
- AI output validation failure.
- Database read/write failure.
- Highlight anchor recovery failure.

Technical diagnostics should include:

- Error category.
- Relevant operation.
- Timestamp.
- Safe request or correlation ID where available.

Never include secrets in logs.

The application must remain usable when AI services are unavailable. Users should still be able to open documents, navigate pages, edit notes, and view saved annotations.

## 15. Testing Strategy

### 15.1 Unit Tests

Cover:

- Page index conversion.
- Context builder behavior.
- Provider configuration validation.
- Provider error normalization.
- Annotation ownership and revision behavior.
- Highlight anchor resolution.
- Daily task scheduling and status transitions.
- Configuration migration.
- Structured AI response validation.

### 15.2 Integration Tests

Cover:

- Import PDF → extract page text → save document.
- Import PPTX → extract slide text → navigate slides.
- Create annotation → close application → reload annotation.
- Create highlight → navigate away → return to the page.
- Submit a question with page context.
- Stream an AI response and persist the final message.
- Switch provider and preserve conversation history.
- Regenerate an AI note without overwriting user edits.

### 15.3 End-to-End Tests

Minimum critical workflows:

1. First launch and workspace initialization.
2. Import and open a PDF.
3. Navigate to a specific page.
4. Select text and ask AI.
5. Create a highlight and verify persistence.
6. Edit an AI-generated note.
7. Generate and complete a learning task.
8. Configure and test an AI provider.
9. Restart the app and restore the previous workspace.
10. Use core reading and annotation functions with AI disconnected.

### 15.4 Release Gates

A release candidate must pass:

- Type checking.
- Linting.
- Unit tests.
- Integration tests for implemented features.
- Production build.
- Windows packaging smoke test.
- Manual verification of critical workflows.

Do not mark a feature complete merely because its UI renders.

## 16. Phased Development Roadmap

### Phase 0 — Project Foundation

**Objective:** Establish a reproducible development environment.

Tasks:

- Initialize Tauri, React, TypeScript, and Vite.
- Configure strict TypeScript rules.
- Set up formatting and linting.
- Add a basic test runner.
- Create the initial folder structure.
- Define shared error handling and logging.
- Document the local development workflow.
- Verify a Windows development build.

Deliverables:

- Runnable desktop application.
- README with setup instructions.
- Initial CI checks.
- Architecture and decision records.

Acceptance criteria:

- A developer can clone the repository, install dependencies, and run the application.
- The application can be packaged for Windows.
- CI detects type errors and failing tests.

### Phase 1 — Workspace UI and Local Persistence

**Objective:** Build the basic learning workspace without AI dependencies.

Tasks:

- Implement resizable left and right sidebars.
- Implement the central workspace and bottom chat area.
- Implement document-library navigation.
- Implement settings and dialog infrastructure.
- Integrate SQLite.
- Add database migrations.
- Persist workspace preferences.
- Add document and page domain types.

Deliverables:

- Main workspace UI.
- Database schema and repositories.
- Basic settings persistence.

Acceptance criteria:

- Layout remains usable when the window is resized.
- Workspace preferences survive application restart.
- Database initialization and migrations work on a clean installation.

### Phase 2 — Document Import and Reading

**Objective:** Make PDF and PPTX reading reliable.

Tasks:

- Implement PDF import and rendering.
- Implement PPTX text extraction and slide navigation.
- Implement page/slide navigation.
- Display current page and total page count.
- Implement text selection.
- Persist document metadata and extracted text.
- Implement search within a document.
- Handle malformed or unsupported files.

Deliverables:

- Functional PDF reader.
- Functional text-based PPTX reader.
- Document library.
- Unified page-context model.

Acceptance criteria:

- Users can import, reopen, and navigate supported documents.
- The active page reference is correct.
- Document text is accessible to downstream services.
- Original files are not accidentally modified.

### Phase 3 — Annotations and Highlights

**Objective:** Complete the core local learning workflow.

Tasks:

- Implement manual annotations.
- Implement text highlights and color selection.
- Persist selection anchors.
- Restore highlights after page navigation and restart.
- Implement annotation editing.
- Implement note filtering by document and page.
- Handle unresolved anchors gracefully.

Deliverables:

- Persistent notes.
- Persistent highlights.
- Right-side annotation panel.

Acceptance criteria:

- Users can create, edit, and delete their notes.
- Highlights remain associated with the correct source page.
- Unsupported selections degrade gracefully instead of silently attaching to the wrong text.

### Phase 4 — AI Provider Infrastructure

**Objective:** Integrate AI without coupling it to the UI.

Tasks:

- Define provider and request/response contracts.
- Implement the provider registry.
- Implement an OpenAI-compatible adapter.
- Add provider settings and secure credential management.
- Implement connection testing.
- Implement streaming responses.
- Add timeout, cancellation, and error normalization.
- Add mocked-provider tests.

Deliverables:

- Provider configuration UI.
- Provider adapter.
- AI service layer.
- Unified error handling.

Acceptance criteria:

- A provider can be configured and tested.
- A request can be executed through the adapter.
- Provider errors are mapped to stable error codes.
- API keys are not exposed in logs or committed configuration.
- Switching providers does not break local document features.

### Phase 5 — Contextual Chat and Page Explanation

**Objective:** Connect AI to actual learning material.

Tasks:

- Implement the centralized context builder.
- Include current page references in chat requests.
- Implement selection-based Q&A.
- Implement page explanation generation.
- Validate structured model output.
- Render streaming responses.
- Persist conversations.
- Save AI explanations as annotation revisions.
- Preserve user edits during regeneration.

Deliverables:

- Bottom AI chat.
- Context-aware questions.
- Page-by-page AI explanations.
- Editable AI annotation workflow.

Acceptance criteria:

- AI requests contain the correct active page context.
- Selection-based questions preserve the selected text and source page.
- Generated explanations are associated with the correct document and page.
- Invalid model output does not corrupt saved data.
- Regeneration does not silently overwrite user edits.

### Phase 6 — Daily Learning Plan

**Objective:** Turn documents and AI explanations into a structured study workflow.

Tasks:

- Implement task creation and management.
- Generate tasks from learning goals and selected references.
- Link tasks to documents and pages.
- Implement completion and postponement.
- Track basic progress.
- Add daily task filtering.
- Support regeneration of incomplete plans without duplicating completed tasks.

Deliverables:

- Daily task panel.
- AI-generated learning plans.
- Task status persistence.
- Basic progress overview.

Acceptance criteria:

- Tasks can be created manually and by AI.
- AI-generated tasks are validated before persistence.
- Completed tasks are preserved when a plan is regenerated.
- Tasks can navigate to their associated source page.

### Phase 7 — Hardening and Windows Release

**Objective:** Prepare the application for regular use.

Tasks:

- Improve large-document performance.
- Improve parsing error recovery.
- Review application permissions.
- Add backup/export capabilities.
- Test installation and upgrade paths.
- Validate database migration behavior.
- Add end-to-end tests.
- Improve accessibility and keyboard navigation.
- Prepare release packaging and documentation.

Deliverables:

- Windows installer.
- Release checklist.
- User documentation.
- Known limitations and troubleshooting guide.

Acceptance criteria:

- Critical workflows pass on a clean Windows installation.
- The app remains usable without an AI connection.
- User data persists across restart and supported upgrades.
- Known limitations are documented.

### Suggested Delivery Priority

Prioritize Phases 0–3 before building a complete AI workflow. Implement Phases 4–5 next, then Phase 6. Phase 7 should begin as soon as the first end-to-end workflow exists rather than being postponed entirely until the end.

## 17. Performance Requirements

Initial targets are engineering goals, not guarantees.

- Workspace should render promptly after launch.
- Page navigation should remain responsive for ordinary documents.
- Large documents should be processed incrementally where possible.
- Long AI responses must not block the UI thread.
- File parsing must support cancellation where feasible.
- Repeated navigation should reuse cached page data when appropriate.
- Expensive extraction must not run on every React render.
- Streaming output must update incrementally without excessive re-rendering.
- Database operations should not block the main UI thread.

Measure actual performance before introducing worker threads, caching layers, or more complex infrastructure.

## 18. Accessibility and UX Requirements

- Support keyboard navigation for primary controls.
- Provide visible focus states.
- Avoid color-only indicators for task status or annotation ownership.
- Distinguish AI-generated content from user-created content.
- Clearly display loading, empty, error, and completed states.
- Provide cancellation for long-running AI operations.
- Confirm destructive actions.
- Avoid losing unsaved annotation edits when switching pages.
- Keep the current document and page visible in the AI interaction context.
- Preserve the user's scroll position where appropriate.
- Make panel resizing and visibility preferences persistent.

## 19. AI Coding Agent Workflow

Before implementing a feature, the agent must:

1. Read `AGENTS.md` and relevant documents under `docs/`.
2. Inspect the current repository structure and existing implementation.
3. Identify the affected modules and their public interfaces.
4. Check whether the feature requires a database migration.
5. Define acceptance criteria and test cases.
6. Implement the smallest complete vertical slice.
7. Run relevant tests and static checks.
8. Update documentation and contracts when behavior changes.
9. Report files changed, tests executed, and known limitations.

### Implementation Rules

- Do not rewrite unrelated modules without justification.
- Do not introduce a new dependency when existing functionality is sufficient.
- Do not create speculative abstractions without a concrete use case.
- Do not bypass service interfaces for convenience.
- Do not silently change database contracts.
- Do not hard-code API keys, local absolute paths, or provider-specific behavior into UI components.
- Do not claim that tests passed unless they were actually executed.
- Do not claim that a feature is complete if only its visual interface exists.
- Do not replace real persistence with in-memory state for a feature whose contract requires persistence.
- If requirements conflict, document the conflict and propose a minimal resolution before making a high-impact change.

### Completion Report Template

For each completed task, report:

- **Scope:** What was implemented.
- **Files changed:** Main files and responsibilities.
- **Contracts:** Interfaces, schemas, or migrations changed.
- **Verification:** Tests and build commands actually executed.
- **Limitations:** Known gaps or unsupported cases.
- **Next step:** The next smallest useful implementation task.

## 20. Definition of Done

A feature is considered complete only when:

- Its intended behavior is implemented.
- Its service interfaces and types are consistent.
- Its loading, error, cancellation, and empty states are handled where applicable.
- Its data persists when persistence is required.
- Its security and privacy implications have been considered.
- Its relevant automated tests pass.
- Its user-facing behavior has been verified.
- Its documentation is updated.
- It does not break existing critical workflows.

## 21. Initial Implementation Order

Start with the following tasks in order:

1. Initialize the desktop application and development tooling.
2. Implement the main three-area workspace layout.
3. Define the shared document/page context contract.
4. Integrate SQLite and initial migrations.
5. Implement PDF import, rendering, and page navigation.
6. Implement PPTX text extraction and slide navigation.
7. Implement persistent manual annotations.
8. Implement text highlights and selection-based source anchors.
9. Implement the AI provider contract and mocked adapter.
10. Implement the first real provider adapter.
11. Implement context-aware AI chat.
12. Implement page-by-page explanations and editable AI annotations.
13. Implement AI-generated daily learning tasks.
14. Add comprehensive integration tests and package the Windows release.

**First milestone:** Deliver a desktop application that can import a PDF, navigate to a specific page, create and save a note, highlight selected text, restart the app, and recover the note and highlight correctly.

Only after this milestone is stable should the project rely on AI generation as a core workflow.