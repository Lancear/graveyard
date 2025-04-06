import { type Accessor, createSignal, type Setter } from "solid-js";
import type { Point, WhiteboardNode } from "../domain.ts";

export interface WhiteboardState {
  zoom: Accessor<number>;
  offset: Accessor<Point>;
  nodes: Accessor<WhiteboardNode[]>;
  setZoom: Setter<number>;
  setOffset: Setter<Point>;
  setNodes: Setter<WhiteboardNode[]>;
  addNodeFromScreen(node: WhiteboardNode): void;
}

export function createWhiteboardState() {
  const [zoom, setZoom] = createSignal(1);
  const [offset, setOffset] = createSignal<Point>({ x: 0, y: 0 });
  const [nodes, setNodes] = createSignal<WhiteboardNode[]>([]);

  return {
    zoom,
    offset,
    nodes,
    setZoom,
    setOffset,
    setNodes,
    addNodeFromScreen(node: WhiteboardNode) {
      node.topLeft = toWhiteboardPoint(this, node.topLeft);
      node.bottomRight = toWhiteboardPoint(this, node.bottomRight);

      if (node.type === "line") {
        node.start = toWhiteboardPoint(this, node.start);
        node.end = toWhiteboardPoint(this, node.end);
      }

      this.setNodes((
        nodes,
      ) => [...nodes, node]);
    },
  };
}

export function toWhiteboardPoint(whiteboard: WhiteboardState, point: Point) {
  const zoom = whiteboard.zoom();
  const unzoomed = { x: point.x * (1 / zoom), y: point.y * (1 / zoom) };

  const offset = whiteboard.offset();
  return { x: unzoomed.x + offset.x, y: unzoomed.y + offset.y };
}

export function toScreenPoint(whiteboard: WhiteboardState, point: Point) {
  const zoom = whiteboard.zoom();
  const zoomed = { x: point.x * zoom, y: point.y * zoom };
  const offset = whiteboard.offset();
  const moved = { x: zoomed.x - offset.x, y: zoomed.y - offset.y };
  return moved;
}

export function normalizeRectangle(a: Point, b: Point) {
  const [leftX, rightX] = a.x < b.x ? [a.x, b.x] : [b.x, a.x];
  const [topY, bottomY] = a.y < b.y ? [a.y, b.y] : [b.y, a.y];

  return {
    topLeft: { x: leftX, y: topY },
    bottomRight: { x: rightX, y: bottomY },
  };
}

export function getRectangleSize(
  topLeft: Point,
  bottomRight: Point,
) {
  return {
    w: bottomRight.x - topLeft.x,
    h: bottomRight.y - topLeft.y,
  };
}

export function getNodeScreenSize(
  whiteboard: WhiteboardState,
  node: WhiteboardNode,
) {
  const size = getRectangleSize(node.topLeft, node.bottomRight);
  const zoom = whiteboard.zoom();

  return {
    w: size.w * zoom,
    h: size.h * zoom,
  };
}
