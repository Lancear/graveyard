import type { AnyBulkWriteOperation } from "mongodb";
import { logger } from "../monitoring/monitoring.ts";
import type { nullish } from "../utils/optional.ts";
import type { WhiteboardInfrastructure } from "./api.ts";
import type { Whiteboard, WhiteboardNode } from "./domain.ts";

export async function getWhiteboard(
  { whiteboardsDb }: WhiteboardInfrastructure,
  whiteboardId: string,
) {
  const boardDocument: Whiteboard | nullish = await whiteboardsDb.findOne({
    _id: whiteboardId,
  });

  if (boardDocument) delete boardDocument._id;
  return boardDocument ?? undefined;
}

export async function getNodes(
  { whiteboardNodesDb }: WhiteboardInfrastructure,
  whiteboardId: string,
) {
  const nodeDocuments: WhiteboardNode[] = await whiteboardNodesDb.find({
    whiteboardId,
  }).toArray();

  return nodeDocuments.map((node) => {
    delete node._id;
    delete node.whiteboardId;
    return node;
  });
}

export async function replaceNodes(
  { whiteboardNodesDb }: WhiteboardInfrastructure,
  whiteboardId: string,
  nodes: Omit<WhiteboardNode, "whiteboardId">[],
) {
  const operations: AnyBulkWriteOperation<WhiteboardNode>[] = nodes.map((
    n,
  ) => ({
    replaceOne: {
      filter: { _id: n.nodeId },
      replacement: { ...n, _id: n.nodeId, whiteboardId },
      upsert: true,
    },
  }));

  const result = await whiteboardNodesDb.bulkWrite(operations, {
    ordered: false,
  });

  logger.debug("Bulk replace nodes result:", { result });
}
