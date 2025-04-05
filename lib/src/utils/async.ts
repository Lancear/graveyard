import { ulid } from "ulid";
import { isNullish, notNullish } from "./optional.ts";

export function timeout(ms: number) {
  if (ms === 0) return Promise.resolve();

  // eslint-disable-next-line avoid-new
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class PendingPromises {
  protected promises: Map<string, Promise<void>> = new Map();

  add(promise: Promise<void>) {
    const promiseId = ulid();
    this.promises.set(
      promiseId,
      promise.finally(() => this.promises.delete(promiseId)),
    );
  }

  async awaitAll() {
    return await Promise.allSettled(this.promises.values());
  }
}

type BatchHandler<T> = (batch: T[]) => Promise<void>;

interface BackgroundBatcherOptions {
  /**
   * Delay before the next batch is executed.
   * All following requests within this delay will be added to the batch.
   */
  collectTime: number;
}

export class BackgroundBatcher<T> {
  protected handler: BatchHandler<T>;
  protected options: BackgroundBatcherOptions;
  protected currentBatch: T[];
  protected pendingPromises: PendingPromises;
  protected currentTimeout?: number;

  constructor(handler: BatchHandler<T>, options: BackgroundBatcherOptions) {
    this.handler = handler;
    this.options = options;
    this.currentBatch = [];
    this.pendingPromises = new PendingPromises();
    this.currentTimeout = undefined;
  }

  public addTask(task: T) {
    this.currentBatch.push(task);

    if (isNullish(this.currentTimeout)) {
      this.currentTimeout = setTimeout(() => {
        this.currentTimeout = undefined;

        this.pendingPromises.add(this.handler(this.currentBatch));
        this.currentBatch = [];
      }, this.options.collectTime);
    }
  }

  public async flush() {
    // handle current batch immediately
    if (this.currentBatch.length > 0) {
      // cancel any ongoing delays
      if (notNullish(this.currentTimeout)) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = undefined;
      }

      this.pendingPromises.add(this.handler(this.currentBatch));
      this.currentBatch = [];
    }

    await this.pendingPromises.awaitAll();
  }
}
