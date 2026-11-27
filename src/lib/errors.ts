export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "NETWORK"
  | "UNKNOWN";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string, status = 500, cause?: unknown) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

interface SupabaseLikeError {
  code?: string;
  message?: string;
  status?: number;
  details?: string;
}

function isSupabaseLikeError(err: unknown): err is SupabaseLikeError {
  return typeof err === "object" && err !== null && ("code" in err || "message" in err);
}

export function mapSupabaseError(err: unknown, fallback = "Unable to complete request."): AppError {
  if (err instanceof AppError) return err;

  if (!isSupabaseLikeError(err)) {
    return new AppError("UNKNOWN", fallback, 500, err);
  }

  const code = err.code ?? "";
  const msg = err.message ?? fallback;
  const status = err.status ?? 500;

  if (code === "23505") {
    return new AppError("CONFLICT", "A record with this unique value already exists.", 409, err);
  }
  if (code === "23503") {
    return new AppError(
      "VALIDATION",
      "Referenced record does not exist or cannot be removed while in use.",
      400,
      err,
    );
  }
  if (code === "23514" || code === "22P02") {
    return new AppError("VALIDATION", "Submitted data failed database validation.", 400, err);
  }
  if (code === "42501" || status === 403) {
    return new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403, err);
  }
  if (code === "PGRST116" || status === 404) {
    return new AppError("NOT_FOUND", "The requested record was not found.", 404, err);
  }
  if (code === "invalid_credentials") {
    return new AppError("UNAUTHORIZED", "Invalid email/ID or password.", 401, err);
  }
  if (code === "email_not_confirmed") {
    return new AppError("UNAUTHORIZED", "Please verify your email address before signing in.", 401, err);
  }
  if (code === "over_request_rate_limit" || status === 429) {
    return new AppError("RATE_LIMITED", "Too many requests. Please wait a moment and try again.", 429, err);
  }
  if (status === 401) {
    return new AppError("UNAUTHORIZED", "Your session has expired. Please sign in again.", 401, err);
  }

  return new AppError("UNKNOWN", msg || fallback, status >= 400 ? status : 500, err);
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  return mapSupabaseError(err, fallback).message;
}
