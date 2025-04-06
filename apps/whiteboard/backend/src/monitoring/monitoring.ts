import { Context, type ContextAttributes } from "./context.ts";
import { ContextualError, type ContextualErrorOptions } from "./error.ts";
import { ConsoleLogDestination } from "./log-destinations/console.ts";
import { type LogDestination, Logger } from "./logger.ts";

export class Monitoring {
  public readonly context: Context;
  public readonly logger: Logger;

  public constructor() {
    this.context = new Context();
    this.logger = new Logger(this.context, new ConsoleLogDestination());
  }

  public pushContext(attributes: ContextAttributes) {
    this.context.push(attributes);
  }

  public popContext() {
    return this.context.pop();
  }

  public newError(message: string, options?: ContextualErrorOptions) {
    return new ContextualError(this.context, message, options);
  }

  public setLogDestination(destination: LogDestination) {
    return this.logger.setDestination(destination);
  }
}

export const monitoring = new Monitoring();
export const logger = monitoring.logger;
