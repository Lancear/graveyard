import type { Collection } from "mongodb";
import { BackgroundBatcher } from "../../utils/async.ts";
import { Context } from "../context.ts";
import { type LogDestination, type LogEntry, Logger } from "../logger.ts";
import { ConsoleLogDestination } from "./console.ts";

interface MongoDbLogDestinationOptions {
  consoleLogs?: boolean;
}

export class MongoDbLogDestination implements LogDestination {
  protected readonly dbCollection: Collection;
  protected readonly batcher: BackgroundBatcher<LogEntry>;
  protected readonly consoleLogDestination?: ConsoleLogDestination;

  constructor(
    dbCollection: Collection,
    options?: MongoDbLogDestinationOptions,
  ) {
    this.dbCollection = dbCollection;
    this.consoleLogDestination = options?.consoleLogs
      ? new ConsoleLogDestination()
      : undefined;

    const debugLogger = new Logger(new Context(), new ConsoleLogDestination());

    this.batcher = new BackgroundBatcher(async (logs: LogEntry[]) => {
      debugLogger.debug("Saving logs to mongodb...", { nrOfLogs: logs.length });
      await dbCollection.insertMany(
        logs.map((log: LogEntry & { _id?: string }) => {
          log._id = log.id;
          return log;
        }),
      );
      debugLogger.debug("Saved the logs");
    }, { collectTime: 100 });
  }

  public log(entry: LogEntry) {
    this.consoleLogDestination?.log(entry);
    this.batcher.addTask(entry);
  }

  public flush() {
    return this.batcher.flush();
  }
}
