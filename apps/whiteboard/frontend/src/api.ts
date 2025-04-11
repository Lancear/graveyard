import type { WhiteboardNode, WhiteboardWithNodes } from "./domain.ts";

export async function fetchWhiteboard(whiteboardId: string) {
  const res = await fetch(`/api/whiteboards/${whiteboardId}`);
  const jsonBody = await res.text();
  return JSON.parse(jsonBody) as WhiteboardWithNodes;
}

export async function saveWhiteboardNodes(
  whiteboardId: string,
  nodes: WhiteboardNode[],
) {
  const res = await fetch(`/api/whiteboards/${whiteboardId}/nodes`, {
    method: "patch",
    body: JSON.stringify(nodes),
    headers: { "Content-Type": "application/json" },
  });

  console.log(res.statusText);
}
