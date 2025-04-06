export interface Point {
  x: number;
  y: number;
}

export interface Size {
  h: number;
  w: number;
}

export interface TextNode {
  _id?: string;
  whiteboardId?: string;
  nodeId: string;
  name: string;
  type: "text";
  topLeft: Point;
  bottomRight: Point;
  markdown: string;
}

export interface RectangleNode {
  _id?: string;
  whiteboardId?: string;
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
  _id?: string;
  whiteboardId?: string;
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
  _id?: string;
  whiteboardId: string;
  name: string;
}
