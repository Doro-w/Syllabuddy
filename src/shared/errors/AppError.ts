/**
 * Application-level error with a stable category, used to produce
 * user-facing messages and safe diagnostics at service boundaries.
 * See AGENTS.md §2.6 (type safety) and §14 (error handling).
 */
export type AppErrorCategory =
  | "validation"
  | "document"
  | "database"
  | "ai"
  | "network"
  | "unknown";

export interface AppError {
  category: AppErrorCategory;
  message: string;
  /** Optional cause; must never be serialized with secrets into logs. */
  cause?: unknown;
  correlationId?: string;
}

export function appError(
  category: AppErrorCategory,
  message: string,
  options?: { cause?: unknown; correlationId?: string },
): AppError {
  return {
    category,
    message,
    ...(options?.cause !== undefined ? { cause: options.cause } : {}),
    ...(options?.correlationId !== undefined ? { correlationId: options.correlationId } : {}),
  };
}
