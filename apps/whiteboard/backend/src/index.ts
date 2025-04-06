import { MongoClient } from "mongodb";
import { api } from "./core/api.ts";
import { MongoDbLogDestination } from "./monitoring/log-destinations/mongodb.ts";
import { logger, monitoring } from "./monitoring/monitoring.ts";
import { neverNullish } from "./utils/optional.ts";

try {
  const databaseUrl = neverNullish(
    Deno.env.get("DATABASE_URL"),
    "DATABASE_ENV is a required env variable",
  );

  logger.info("Connecting to database...");
  const database = await connectToDb(databaseUrl);
  logger.info("Connected to database");

  logger.info("Connecting logger to database...");
  logger.setDestination(
    new MongoDbLogDestination(database.collection("logs"), {
      consoleLogs: true,
    }),
  );
  logger.info("Connected logger to database");

  logger.info("Creating database collections...");
  const whiteboardsDb = database.collection("whiteboards");
  const whiteboardNodesDb = database.collection("whiteboardNodes");
  logger.info("Created database collections");

  logger.info("Starting server...");
  Deno.serve(
    {
      hostname: "localhost",
      port: 3001,
      onListen() {
        logger.info("Serving at http://localhost:3001");
      },
    },
    api({
      whiteboardsDb,
      whiteboardNodesDb,
    }),
  );
} catch (err) {
  logger.error(err);
  await logger.flush();
  Deno.exit(1);
}

async function connectToDb(databaseUrl: string) {
  try {
    const client = new MongoClient(databaseUrl);
    await client.connect();
    return client.db();
  } catch (err) {
    throw monitoring.newError("Failed to connect to the database", {
      data: { databaseUrl },
      cause: err,
    });
  }
}
