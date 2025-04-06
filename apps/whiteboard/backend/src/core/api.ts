import type { Collection } from "mongodb";
import type { Whiteboard, WhiteboardNode } from "../core/domain.ts";
import { getWhiteboard, replaceNodes } from "../core/logic.ts";
import { HttpEndpoint, pathParam, pathRegex } from "../utils/http.ts";

export interface WhiteboardInfrastructure {
  whiteboardsDb: Collection<Whiteboard>;
  whiteboardNodesDb: Collection<WhiteboardNode>;
}

const endpoints: HttpEndpoint<WhiteboardInfrastructure>[] = [{
  method: "get",
  path: pathRegex("api", "whiteboards", pathParam("whiteboardId")),
  async handler(infra, _req, pathParams) {
    const whiteboard = await getWhiteboard(infra, pathParams["whiteboardId"]);

    if (!whiteboard) {
      return new Response(undefined, { status: 404 });
    }

    return new Response(JSON.stringify(whiteboard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
}, {
  method: "patch",
  path: pathRegex("api", "whiteboards", pathParam("whiteboardId"), "nodes"),
  async handler(infra, req, pathParams) {
    const jsonBody = await req.text();
    const nodes = JSON.parse(jsonBody) as Omit<
      WhiteboardNode,
      "whiteboardId"
    >[];

    await replaceNodes(infra, pathParams["whiteboardId"], nodes);
    return new Response(undefined, { status: 200 });
  },
}];

export function api(infra: WhiteboardInfrastructure) {
  return async function apiRequestHandler(req: Request): Promise<Response> {
    const { pathname } = new URL(req.url);

    for (const endpoint of endpoints) {
      if (req.method.toLowerCase() === endpoint.method) {
        const matches = pathname.match(endpoint.path);

        if (matches) {
          return endpoint.handler(infra, req, matches.groups ?? {});
        }
      }
    }

    return new Response(undefined, { status: 404 });
  };
}
