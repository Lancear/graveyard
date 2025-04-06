import type { WhiteboardInfrastructure } from "./api.ts";
import * as db from "./db.ts";
import type { WhiteboardNode } from "./domain.ts";

export async function getWhiteboard(
  infra: WhiteboardInfrastructure,
  whiteboardId: string,
) {
  const whiteboard = await db.getWhiteboard(infra, whiteboardId);
  if (!whiteboard) return undefined;

  const nodes = await db.getNodes(infra, whiteboardId);
  return { ...whiteboard, nodes };
}

export async function replaceNodes(
  infra: WhiteboardInfrastructure,
  whiteboardId: string,
  nodes: Omit<WhiteboardNode, "whiteboardId">[],
) {
  return await db.replaceNodes(infra, whiteboardId, nodes);
}
