import type { Context, ContextSnapshot } from "./context.ts";

export interface ContextualErrorOptions {
  cause?: unknown;
  name?: string;
  data?: Record<string, unknown>;
}

export class ContextualError extends Error {
  public readonly context: ContextSnapshot;
  public readonly data?: Record<string, unknown>;
  public readonly hints: string[];

  public constructor(
    context: Context,
    message: string,
    options?: ContextualErrorOptions,
  ) {
    super(message, options);
    if (options?.name) this.name = options.name;

    this.context = context.snapshot();
    this.data = options?.data;
    this.hints = [];
  }

  public addHint(hint: string) {
    this.hints.push(hint);
    return this;
  }

  public setMessage(message: string) {
    this.hints.push(this.message);
    this.message = message;
    return this;
  }
}
