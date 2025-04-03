import { timeout } from "./async.ts";
import { notNullish } from "./optional.ts";
import { applyRules } from "./rules.ts";
import { type SafeResult, safeTryAsync } from "./try.ts";

export type RetryInstruction =
  | {
    retry: true;
    retryAfter?: number;
    error?: undefined;
  }
  | { retry: false; error?: Error; retryAfter?: undefined };

export type RetryRule<T> = (
  result: SafeResult<T>,
  attempt: number,
) => RetryInstruction | undefined;

export interface RetryOptions<T> {
  /**
   * The maximum number of retries, excluding the initial attempt.
   */
  maxRetries: number;
  /**
   * The rules which define whether to retry.
   * The first retry instruction received is acted upon.
   */
  retryRules: RetryRule<T>[];
  /**
   * The maximum total backoff time we want to wait while retrying.
   */
  maxTotalBackoffDelay?: number;
  /**
   * The backoff delays to wait between each retry.
   * The last entry will be repeated until `maxRetries` is reached.
   */
  backoffDelays?: number[];
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions<T>,
) {
  let result;
  let backoffDelay;
  let totalBackoffDelay = 0;

  for (let attempt = 1; attempt <= 1 + options.maxRetries; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    if (backoffDelay) await timeout(backoffDelay);

    // eslint-disable-next-line no-await-in-loop
    result = await safeTryAsync(() => fn(attempt));

    const retryInstruction = applyRules(options.retryRules, [
      result,
      attempt,
    ]) ?? { retry: false };

    if (!retryInstruction.retry) {
      if (!result.success) {
        throw retryInstruction.error ?? result.error;
      }

      return result.data;
    }

    backoffDelay = retryInstruction.retryAfter ??
      options.backoffDelays?.[
        Math.min(attempt - 1, options.backoffDelays.length - 1)
      ];

    totalBackoffDelay += backoffDelay ?? 0;

    if (
      notNullish(options.maxTotalBackoffDelay) &&
      totalBackoffDelay >= options.maxTotalBackoffDelay
    ) {
      throw result.error ?? new Error("Invalid result", { cause: result.data });
    }
  }

  throw result?.error ?? new Error("Invalid result", { cause: result?.data });
}
