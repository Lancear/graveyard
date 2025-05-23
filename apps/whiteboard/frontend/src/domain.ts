export interface Point {
  x: number;
  y: number;
}

export interface Size {
  h: number;
  w: number;
}

export interface TextNode {
  nodeId: string;
  name: string;
  type: "text";
  topLeft: Point;
  bottomRight: Point;
  markdown: string;
}

export interface RectangleNode {
  nodeId: string;
  name: string;
  type: "rectangle";
  topLeft: Point;
  bottomRight: Point;
  fillColour?: string;
  strokeColour?: string;
  radius: number;
}

export interface LineNode {
  nodeId: string;
  name: string;
  type: "line";
  topLeft: Point;
  bottomRight: Point;
  start: Point;
  end: Point;
  strokeColour?: string;
}

export type WhiteboardNode = TextNode | RectangleNode | LineNode;

export interface Whiteboard {
  whiteboardId: string;
  name: string;
}

export interface WhiteboardWithNodes extends Whiteboard {
  nodes: WhiteboardNode[];
}
