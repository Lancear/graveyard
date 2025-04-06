import { ulid } from "ulid";
import { logger, monitoring } from "../monitoring.ts";

type RequestHandler = (req: Request) => Promise<Response>;

export function requestMonitor(handler: RequestHandler): RequestHandler {
  return async (req) => {
    monitoring.pushContext({
      requestId: ulid(),
    });

    logger.debug("Incoming request", { method: req.method, url: req.url });

    try {
      const res = await handler(req);
      logger.debug("Outgoing response", { status: res.status });
      return res;
    } catch (err) {
      const res = new Response(undefined, { status: 500 });
      const error = monitoring.newError("Uncaught error handling request", {
        cause: err,
      });

      logger.error(error);
      logger.debug("Outgoing response", { status: res.status });
      return res;
    } finally {
      monitoring.popContext();
    }
  };
}
