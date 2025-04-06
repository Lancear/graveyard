import type { Accessor, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { ulid } from "ulid";
import type { Point } from "../domain.ts";
import { between, toFixed } from "../utils.ts";
import type { RendererState } from "./renderer.ts";
import {
  getRectangleSize,
  normalizeRectangle,
  toWhiteboardPoint,
  type WhiteboardState,
} from "./whiteboard.ts";

export type InputMode =
  | "select"
  | "move"
  | "text"
  | "rectangle"
  | "line";

export interface InputState {
  inputMode: Accessor<InputMode>;
  mouseDownEvent: Accessor<MouseEvent | undefined>;
  selectedNodeIds: Accessor<string[]>;

  setInputMode: Setter<InputMode>;
  setMouseDownEvent: Setter<MouseEvent | undefined>;
  setSelectedNodeIds: Setter<string[]>;
}

export function createInputState() {
  const [inputMode, setInputMode] = createSignal<InputMode>("select");

  const [mouseDownEvent, setMouseDownEvent] = createSignal<
    MouseEvent | undefined
  >(
    undefined,
  );

  const [selectedNodeIds, setSelectedNodeIds] = createSignal<string[]>([]);

  return {
    inputMode,
    setInputMode,
    mouseDownEvent,
    setMouseDownEvent,
    selectedNodeIds,
    setSelectedNodeIds,
  };
}

interface InputHandlerState {
  whiteboard: WhiteboardState;
  input: InputState;
  renderer: RendererState;
}

interface InputHandlers {
  onClick?(e: MouseEvent, state: InputHandlerState): void;
  onMouseDown?(e: MouseEvent, state: InputHandlerState): void;
  onMouseMove?(e: MouseEvent, state: InputHandlerState): void;
  onMouseUp?(e: MouseEvent, state: InputHandlerState): void;
  onWheel?(e: MouseEvent, state: InputHandlerState): void;
}

const INPUT_MODE_HANDLERS: Record<InputMode, InputHandlers> = {
  select: {
    onMouseMove(currMousePos, { input, renderer }) {
      const ctx = renderer.shapeEditingLayer();
      if (!ctx) return;

      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const { topLeft, bottomRight } = normalizeRectangle(
        mouseDown,
        currMousePos,
      );

      const size = getRectangleSize(topLeft, bottomRight);
      const rendererSize = renderer.size();

      ctx.clearRect(0, 0, rendererSize.w, rendererSize.h);
      ctx.fillStyle = "#e1c49d33";
      ctx.strokeStyle = "#d0b46566";
      ctx.beginPath();
      ctx.roundRect(topLeft.x, topLeft.y, size.w, size.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e1c49d66";
      ctx.strokeStyle = "#d0b46599";
    },
    onMouseUp(mouseUp, { whiteboard, input }) {
      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const rect = normalizeRectangle(mouseUp, mouseDown);
      const size = getRectangleSize(rect.topLeft, rect.bottomRight);

      if (size.h * size.w < 4) {
        const whiteboardClick = toWhiteboardPoint(whiteboard, mouseUp);

        const clickedNode = whiteboard.nodes().find((n) =>
          between(whiteboardClick.x, n.topLeft.x, n.bottomRight.x) &&
          between(whiteboardClick.y, n.topLeft.y, n.bottomRight.y)
        );

        if (clickedNode) {
          input.setSelectedNodeIds([clickedNode.nodeId]);
        }
      } else {
        const topLeft = toWhiteboardPoint(whiteboard, rect.topLeft);
        const bottomRight = toWhiteboardPoint(whiteboard, rect.bottomRight);

        const selectedNodes = whiteboard.nodes().filter((n) =>
          between(n.topLeft.x, topLeft.x, bottomRight.x) &&
          between(n.topLeft.y, topLeft.y, bottomRight.y) &&
          between(n.bottomRight.x, topLeft.x, bottomRight.x) &&
          between(n.bottomRight.y, topLeft.y, bottomRight.y)
        );

        input.setSelectedNodeIds(selectedNodes.map((n) => n.nodeId));
      }
    },
  },
  move: {
    onMouseMove(
      currMousePos,
      { whiteboard, input },
    ) {
      if (!input.mouseDownEvent()) return;

      whiteboard.setOffset((old) => ({
        x: old.x - currMousePos.movementX,
        y: old.y - currMousePos.movementY,
      }));
    },
  },
  text: {
    onClick(click, { whiteboard, input }) {
      const zoom = whiteboard.zoom();
      const nodeId = ulid();
      whiteboard.addNodeFromScreen({
        nodeId,
        name: "Text",
        type: "text",
        topLeft: { x: click.x - 8, y: click.y - 18 },
        bottomRight: {
          x: click.x - 8 + (24 * 4 * zoom),
          y: click.y - 18 + (9 * 4 * zoom),
        },
        markdown: "",
      });

      input.setSelectedNodeIds([nodeId]);
    },
  },
  rectangle: {
    onMouseMove(currMousePos, { input, renderer }) {
      const ctx = renderer.shapeEditingLayer();
      if (!ctx) return;

      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const { topLeft, bottomRight } = normalizeRectangle(
        mouseDown,
        currMousePos,
      );

      const size = getRectangleSize(topLeft, bottomRight);
      const rendererSize = renderer.size();

      ctx.clearRect(0, 0, rendererSize.w, rendererSize.h);
      ctx.beginPath();
      ctx.roundRect(topLeft.x, topLeft.y, size.w, size.h);
      ctx.stroke();
    },
    onMouseUp(mouseUp, { whiteboard, input }) {
      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const { topLeft, bottomRight } = normalizeRectangle(mouseDown, mouseUp);
      const size = getRectangleSize(topLeft, bottomRight);

      if (size.h * size.w > 4) {
        whiteboard.addNodeFromScreen({
          nodeId: ulid(),
          name: "Rectangle",
          type: "rectangle",
          topLeft,
          bottomRight,
          radius: 6,
          strokeColour: "#c75249",
        });
      }
    },
  },
  line: {
    onMouseMove(
      currMousePos,
      { input, renderer },
    ) {
      const ctx = renderer.shapeEditingLayer();
      if (!ctx) return;

      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const rendererSize = renderer.size();
      ctx.clearRect(0, 0, rendererSize.w, rendererSize.h);
      ctx.beginPath();
      ctx.moveTo(mouseDown.x, mouseDown.y);
      ctx.lineTo(currMousePos.x, currMousePos.y);
      ctx.stroke();
    },
    onMouseUp(mouseUp, { whiteboard, input }) {
      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const { topLeft, bottomRight } = normalizeRectangle(mouseDown, mouseUp);

      whiteboard.addNodeFromScreen({
        nodeId: ulid(),
        name: "Line",
        type: "line",
        topLeft,
        bottomRight,
        start: { x: mouseDown.x, y: mouseDown.y },
        end: { x: mouseUp.x, y: mouseUp.y },
        strokeColour: "#c75249",
      });
    },
  },
};

export function zoom(
  { whiteboard, renderer }: Pick<InputHandlerState, "whiteboard" | "renderer">,
  zoomDelta: 0.1 | -0.1,
  mousePos?: Point,
) {
  const oldZoom = whiteboard.zoom();
  const newZoom = toFixed(oldZoom + zoomDelta, 2);
  if (newZoom <= 0 || newZoom > 5) return;

  const rendererSize = renderer.size();
  const rendererSizeDelta = {
    w: (rendererSize.w * zoomDelta),
    h: (rendererSize.h * zoomDelta),
  };

  whiteboard.setZoom(newZoom);

  const zoomOrigin = mousePos ??
    { x: rendererSize.w / 2, y: rendererSize.h / 2 };

  whiteboard.setOffset((old) => ({
    x: old.x + (rendererSizeDelta.w * (zoomOrigin.x / rendererSize.w)),
    y: old.y + (rendererSizeDelta.h * (zoomOrigin.y / rendererSize.h)),
  }));
}

export function getHandlers(state: InputHandlerState) {
  return {
    onClick(e: MouseEvent) {
      const inputMode = state.input.inputMode();

      if (inputMode !== "select") {
        state.input.setSelectedNodeIds([]);
      }

      INPUT_MODE_HANDLERS[inputMode].onClick?.(e, state);
    },
    onMouseDown(e: MouseEvent) {
      state.input.setMouseDownEvent(e);
      INPUT_MODE_HANDLERS[state.input.inputMode()].onMouseDown?.(e, state);
    },
    onMouseMove(e: MouseEvent) {
      INPUT_MODE_HANDLERS[state.input.inputMode()].onMouseMove?.(e, state);
    },
    onMouseUp(e: MouseEvent) {
      INPUT_MODE_HANDLERS[state.input.inputMode()].onMouseUp?.(e, state);

      state.input.setMouseDownEvent(undefined);
      const rendererSize = state.renderer.size();
      state.renderer.shapeEditingLayer()?.clearRect(
        0,
        0,
        rendererSize.w,
        rendererSize.h,
      );
    },
    onWheel(e: WheelEvent) {
      zoom(state, e.deltaY > 0 ? -0.1 : 0.1, e);
    },
  };
}
