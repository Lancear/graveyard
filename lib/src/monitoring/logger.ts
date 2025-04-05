import { ulid } from "ulid";
import { ensureErrorInstance } from "../utils/error.ts";
import { toEnumerable } from "../utils/object.ts";
import { safeTryAsync } from "../utils/try.ts";
import type { Context } from "./context.ts";

export type LoggerData = Record<string, unknown>;

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  data?: unknown;
  error?: unknown;
  context?: unknown;
}

export interface LogDestination {
  log(entry: LogEntry): void;
  flush(): Promise<void>;
}

export class Logger {
  protected readonly context: Context;
  protected destination: LogDestination;

  constructor(context: Context, destination: LogDestination) {
    this.context = context;
    this.destination = destination;
  }

  public setDestination(destination: LogDestination) {
    this.destination = destination;
    return this;
  }

  public flush() {
    return safeTryAsync(() => this.destination.flush());
  }

  public debug(message: string, data?: LoggerData) {
    this.destination.log({
      id: ulid(),
      timestamp: new Date(),
      level: "debug",
      message,
      data: toEnumerable(data),
      context: this.context.snapshot(),
    });

    return this;
  }

  public info(message: string, data?: LoggerData) {
    this.destination.log({
      id: ulid(),
      timestamp: new Date(),
      level: "info",
      message,
      data: toEnumerable(data),
      context: this.context.snapshot(),
    });

    return this;
  }

  public warn(message: string, data?: LoggerData) {
    this.destination.log({
      id: ulid(),
      timestamp: new Date(),
      level: "warn",
      message,
      data: toEnumerable(data),
      context: this.context.snapshot(),
    });

    return this;
  }

  public error(err: unknown, message?: string, data?: LoggerData) {
    const error = ensureErrorInstance(err);

    this.destination.log({
      id: ulid(),
      timestamp: new Date(),
      level: "error",
      message: message ?? error.message,
      error: toEnumerable(error),
      data: toEnumerable(data),
      context: this.context.snapshot(),
    });

    return this;
  }
}
