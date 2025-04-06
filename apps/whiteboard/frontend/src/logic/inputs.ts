import type { Accessor, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { ulid } from "ulid";
import type { Point } from "../domain.ts";
import { toFixed } from "../utils.ts";
import type { RendererState } from "./renderer.ts";
import {
  getRectangleSize,
  normalizeRectangle,
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
  selectedTextInput: Accessor<HTMLElement | undefined>;

  setInputMode: Setter<InputMode>;
  setMouseDownEvent: Setter<MouseEvent | undefined>;
  setSelectedTextInput: Setter<HTMLElement | undefined>;
}

export function createInputState() {
  const [inputMode, setInputMode] = createSignal<InputMode>("select");

  const [mouseDownEvent, setMouseDownEvent] = createSignal<
    MouseEvent | undefined
  >(
    undefined,
  );

  const [selectedTextInput, setSelectedTextInput] = createSignal<
    HTMLElement | undefined
  >(
    undefined,
  );

  return {
    inputMode,
    setInputMode,
    mouseDownEvent,
    setMouseDownEvent,
    selectedTextInput,
    setSelectedTextInput,
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
    onMouseDown(e, { input }) {
      input.setMouseDownEvent(e);
    },
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
    onMouseUp(_e, { input, renderer }) {
      input.setMouseDownEvent(undefined);

      const rendererSize = renderer.size();
      renderer.shapeEditingLayer()?.clearRect(
        0,
        0,
        rendererSize.w,
        rendererSize.h,
      );
    },
  },
  move: {
    onMouseDown(e, { input }) {
      input.setMouseDownEvent(e);
    },
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
    onMouseUp(_e, { input }) {
      input.setMouseDownEvent(undefined);
    },
  },
  text: {
    onClick(click, { whiteboard, input, renderer }) {
      const currTextInput = input.selectedTextInput();

      if (currTextInput) {
        if (!(currTextInput as HTMLTextAreaElement).value) {
          renderer.textLayer.ref?.removeChild(currTextInput);
        } else {
          const rect = currTextInput.getBoundingClientRect();

          whiteboard.addNodeFromScreen({
            id: ulid(),
            name: (currTextInput as HTMLTextAreaElement).value,
            type: "text",
            topLeft: { x: rect.left, y: rect.top },
            bottomRight: { x: rect.bottom, y: rect.right },
            markdown: (currTextInput as HTMLTextAreaElement).value,
          });

          input.setSelectedTextInput(undefined);
        }
      }

      const textInput = document.createElement("textarea");
      textInput.addEventListener("click", (e) => e.stopPropagation());
      textInput.addEventListener("mouseup", (e) => e.stopPropagation());
      textInput.addEventListener("mousedown", (e) => e.stopPropagation());
      textInput.addEventListener("wheel", (e) => e.stopPropagation());
      textInput.placeholder = "Insert Text";
      textInput.className =
        "resize-none focus:resize h-9 w-24 px-2 py-1 rounded border border-dashed border-transparent focus:border-[#d0b465cc] focus:outline-none";
      textInput.style.position = "absolute";
      textInput.style.top = click.y - (4.5 * 4) + "px";
      textInput.style.left = click.x - (2 * 4) + "px";

      input.setSelectedTextInput(
        renderer.textLayer.ref?.appendChild(textInput),
      );
      textInput.focus();
    },
  },
  rectangle: {
    onMouseDown(e, { input }) {
      input.setMouseDownEvent(e);
    },
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
    onMouseUp(mouseUp, { whiteboard, input, renderer }) {
      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const { topLeft, bottomRight } = normalizeRectangle(mouseDown, mouseUp);
      const size = getRectangleSize(topLeft, bottomRight);

      if (size.h * size.w > 4) {
        whiteboard.addNodeFromScreen({
          id: ulid(),
          name: "Rectangle",
          type: "rectangle",
          topLeft,
          bottomRight,
          radius: 6,
          strokeColour: "#c75249",
        });
      }

      input.setMouseDownEvent(undefined);

      const rendererSize = renderer.size();
      renderer.shapeEditingLayer()?.clearRect(
        0,
        0,
        rendererSize.w,
        rendererSize.h,
      );
    },
  },
  line: {
    onMouseDown(e, { input }) {
      input.setMouseDownEvent(e);
    },
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
    onMouseUp(mouseUp, { whiteboard, input, renderer }) {
      const mouseDown = input.mouseDownEvent();
      if (!mouseDown) return;

      const { topLeft, bottomRight } = normalizeRectangle(mouseDown, mouseUp);

      whiteboard.addNodeFromScreen({
        id: ulid(),
        name: "Line",
        type: "line",
        topLeft,
        bottomRight,
        start: { x: mouseDown.x, y: mouseDown.y },
        end: { x: mouseUp.x, y: mouseUp.y },
        strokeColour: "#c75249",
      });

      input.setMouseDownEvent(undefined);

      const rendererSize = renderer.size();
      renderer.shapeEditingLayer()?.clearRect(
        0,
        0,
        rendererSize.w,
        rendererSize.h,
      );
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
      INPUT_MODE_HANDLERS[state.input.inputMode()].onClick?.(e, state);
    },
    onMouseDown(e: MouseEvent) {
      INPUT_MODE_HANDLERS[state.input.inputMode()].onMouseDown?.(e, state);
    },
    onMouseMove(e: MouseEvent) {
      INPUT_MODE_HANDLERS[state.input.inputMode()].onMouseMove?.(e, state);
    },
    onMouseUp(e: MouseEvent) {
      INPUT_MODE_HANDLERS[state.input.inputMode()].onMouseUp?.(e, state);
    },
    onWheel(e: WheelEvent) {
      zoom(state, e.deltaY > 0 ? -0.1 : 0.1, e);
    },
  };
}
