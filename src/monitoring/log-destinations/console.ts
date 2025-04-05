import { type LogDestination, type LogEntry } from "../logger.ts";

export class ConsoleLogDestination implements LogDestination {
  public log(entry: LogEntry): void {
    console[entry.level](this.format(entry));
  }

  public flush() {
    return Promise.resolve();
  }

  protected format(entry: LogEntry) {
    const info = {
      data: entry.data,
      error: entry.error,
      context: entry.context,
    };

    return `${entry.timestamp.toTimeString().split(" ")[0]} ${
      entry.level.padEnd(5, " ")
    } |  ${entry.message}  ${JSON.stringify(info, undefined, 2)}`;
  }
}
