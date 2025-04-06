import type { Collection } from "mongodb";
import { BackgroundBatcher } from "../../utils/async.ts";
import { type LogDestination, type LogEntry } from "../logger.ts";
import { ConsoleLogDestination } from "./console.ts";

type MongoDbLogEntry = LogEntry & { _id?: string };

interface MongoDbLogDestinationOptions {
  consoleLogs?: boolean;
}

export class MongoDbLogDestination implements LogDestination {
  protected readonly batcher: BackgroundBatcher<LogEntry>;
  protected readonly consoleLogDestination?: ConsoleLogDestination;

  constructor(
    dbCollection: Collection,
    options?: MongoDbLogDestinationOptions,
  ) {
    this.consoleLogDestination = options?.consoleLogs
      ? new ConsoleLogDestination()
      : undefined;

    // const debugLogger = new Logger(new Context(), new ConsoleLogDestination());
    const typedCollection = dbCollection as unknown as Collection<
      MongoDbLogEntry
    >;

    this.batcher = new BackgroundBatcher(async (logs: LogEntry[]) => {
      // debugLogger.debug("Saving logs to mongodb...", { nrOfLogs: logs.length });

      await typedCollection.insertMany(
        logs.map((log: MongoDbLogEntry) => {
          log._id = log.id;
          return log;
        }),
      );

      // debugLogger.debug("Saved the logs");
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
