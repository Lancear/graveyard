import { createEffect, createSignal, For } from "solid-js";
import { ulid } from "ulid";
import { cls } from "./cls.ts";
import {
  HandIcon,
  IconButton,
  LayersIcon,
  MousePointerIcon,
  SearchIcon,
  SlashIcon,
  SquareIcon,
  TableIcon,
  TypeIcon,
} from "./icons.tsx";

interface Point {
  x: number;
  y: number;
}

interface TextNode {
  id: string;
  name: string;
  type: "text";
  topLeft: Point;
  bottomRight: Point;
  markdown: string;
}

interface RectangleNode {
  id: string;
  name: string;
  type: "rectangle";
  topLeft: Point;
  bottomRight: Point;
  fillColour?: string;
  strokeColour?: string;
  radius: number;
}

interface LineNode {
  id: string;
  name: string;
  type: "line";
  topLeft: Point;
  bottomRight: Point;
  start: Point;
  end: Point;
  strokeColour?: string;
}

type CanvasNode = TextNode | RectangleNode | LineNode;

export function Page() {
  let canvas!: HTMLCanvasElement;

  const [context, setContext] = createSignal<
    CanvasRenderingContext2D | undefined
  >(
    undefined,
  );

  createEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setContext(ctx);
  });

  let editingCanvas!: HTMLCanvasElement;

  const [editingContext, setEditingContext] = createSignal<
    CanvasRenderingContext2D | undefined
  >(
    undefined,
  );

  createEffect(() => {
    const ctx = editingCanvas.getContext("2d");
    if (!ctx) return;

    setEditingContext(ctx);
    ctx.fillStyle = "#e1c49daa";
    ctx.strokeStyle = "#d0b465cc";
  });

  let editingDiv!: HTMLDivElement;

  const [mode, setMode] = createSignal("mouse");

  const [startPoint, setStartPoint] = createSignal<Point | undefined>(
    undefined,
  );

  const [textInput, setTextInput] = createSignal<HTMLElement | undefined>(
    undefined,
  );

  const [zoom, setZoom] = createSignal(1);
  const [offset, setOffset] = createSignal<Point>(
    { x: 0, y: 0 },
  );

  const [nodes, setNodes] = createSignal<CanvasNode[]>(
    [],
  );

  function addNodeFromCanvas(node: CanvasNode) {
    const currOffset = offset();
    const currZoom = zoom();

    node.topLeft.x = (node.topLeft.x - currOffset.x) * (1 / currZoom);
    node.topLeft.y = (node.topLeft.y - currOffset.y) * (1 / currZoom);
    node.bottomRight.x = (node.bottomRight.x - currOffset.x) * (1 / currZoom);
    node.bottomRight.y = (node.bottomRight.y - currOffset.y) * (1 / currZoom);

    if (node.type === "line") {
      node.start.x = (node.start.x - currOffset.x) * (1 / currZoom);
      node.start.y = (node.start.y - currOffset.y) * (1 / currZoom);
      node.end.x = (node.end.x - currOffset.x) * (1 / currZoom);
      node.end.y = (node.end.y - currOffset.y) * (1 / currZoom);
    }

    setNodes((
      nodes,
    ) => [...nodes, node]);
  }

  function getPointOnCanvas(point: Point) {
    const currOffset = offset();
    const currZoom = zoom();

    return {
      x: point.x * currZoom + currOffset.x,
      y: point.y * currZoom + currOffset.y,
    };
  }

  function getNodeSizeOnCanvas(node: CanvasNode) {
    const currZoom = zoom();

    return {
      w: (node.bottomRight.x - node.topLeft.x) * currZoom,
      h: (node.bottomRight.y - node.topLeft.y) * currZoom,
    };
  }

  function drawNodes() {
    const ctx = context();
    if (!ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    while (editingDiv.firstChild) editingDiv.removeChild(editingDiv.firstChild);

    for (const node of nodes()) {
      if (node.type === "rectangle") {
        const topLeft = getPointOnCanvas(node.topLeft);
        const { w, h } = getNodeSizeOnCanvas(node);

        ctx.beginPath();
        ctx.roundRect(topLeft.x, topLeft.y, w, h);
        ctx.stroke();
      }

      if (node.type === "line") {
        const start = getPointOnCanvas(node.start);
        const end = getPointOnCanvas(node.end);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      if (node.type === "text") {
        const topLeft = getPointOnCanvas(node.topLeft);

        const input = document.createElement("textarea");
        input.addEventListener("click", (e) => e.stopPropagation());
        input.addEventListener("mouseup", (e) => e.stopPropagation());
        input.addEventListener("mousedown", (e) => e.stopPropagation());
        input.addEventListener("wheel", (e) => e.stopPropagation());
        input.placeholder = "Insert Text";
        input.className =
          "resize-none focus:resize h-9 w-24 px-2 py-1 rounded border border-dashed border-transparent focus:border-[#d0b465cc] focus:outline-none";
        input.style.position = "absolute";
        input.style.top = topLeft.y + "px";
        input.style.left = topLeft.x + "px";
        input.value = node.markdown;
        editingDiv.appendChild(input);
      }
    }
  }

  createEffect(drawNodes);

  function clickHandler(e: MouseEvent) {
    if (mode() === "type") {
      const currTextInput = textInput();

      if (currTextInput) {
        if (!(currTextInput as HTMLTextAreaElement).value) {
          editingDiv.removeChild(currTextInput);
        } else {
          const rect = currTextInput.getBoundingClientRect();

          addNodeFromCanvas({
            id: ulid(),
            name: (currTextInput as HTMLTextAreaElement).value,
            type: "text",
            topLeft: { x: rect.left, y: rect.top },
            bottomRight: { x: rect.bottom, y: rect.right },
            markdown: (currTextInput as HTMLTextAreaElement).value,
          });

          setTextInput(undefined);
        }
      }

      const input = document.createElement("textarea");
      input.addEventListener("click", (e) => e.stopPropagation());
      input.addEventListener("mouseup", (e) => e.stopPropagation());
      input.addEventListener("mousedown", (e) => e.stopPropagation());
      input.addEventListener("wheel", (e) => e.stopPropagation());
      input.placeholder = "Insert Text";
      input.className =
        "resize-none focus:resize h-9 w-24 px-2 py-1 rounded border border-dashed border-transparent focus:border-[#d0b465cc] focus:outline-none";
      input.style.position = "absolute";
      input.style.top = e.y - (4.5 * 4) + "px";
      input.style.left = e.x - (2 * 4) + "px";

      setTextInput(editingDiv.appendChild(input));
      input.focus();
    }
  }

  function mouseDownHandler(e: MouseEvent) {
    const ctx = context();
    if (!ctx) return;

    setStartPoint({ x: e.x, y: e.y });
  }

  function mouseMoveHandler(e: MouseEvent) {
    const ctx = context();
    if (!ctx) return;

    if (mode() === "hand") {
      if (!startPoint()) return;

      setOffset((old) => ({
        x: old.x + e.movementX,
        y: old.y + e.movementY,
      }));
    }

    if (mode() === "square") {
      const ctx = editingContext();
      if (!ctx) return;

      const start = startPoint();
      if (!start) return;

      const [x, w] = start.x < e.x
        ? [start.x, e.x - start.x]
        : [e.x, start.x - e.x];
      const [y, h] = start.y < e.y
        ? [start.y, e.y - start.y]
        : [e.y, start.y - e.y];

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h);
      ctx.stroke();
    }

    if (mode() === "line") {
      const ctx = editingContext();
      if (!ctx) return;

      const start = startPoint();
      if (!start) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
    }

    if (mode() === "mouse") {
      const ctx = editingContext();
      if (!ctx) return;

      const start = startPoint();
      if (!start) return;

      const [x, w] = start.x < e.x
        ? [start.x, e.x - start.x]
        : [e.x, start.x - e.x];
      const [y, h] = start.y < e.y
        ? [start.y, e.y - start.y]
        : [e.y, start.y - e.y];

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "#e1c49d33";
      ctx.strokeStyle = "#d0b46566";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e1c49d66";
      ctx.strokeStyle = "#d0b46599";
    }
  }

  function wheelHandler(e: WheelEvent) {
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    const canvasSizeDelta = {
      x: window.innerWidth * zoomDelta,
      y: window.innerHeight * zoomDelta,
    };

    const newZoom = zoom() + zoomDelta;
    setZoom(newZoom);
    setOffset((old) => ({
      x: old.x - (canvasSizeDelta.x * (e.x / window.innerWidth)),
      y: old.y - (canvasSizeDelta.y * (e.y / window.innerHeight)),
    }));
  }

  function mouseUpHandler(e: MouseEvent) {
    const ctx = context();
    if (!ctx) return;

    if (mode() === "square") {
      const start = startPoint();
      if (!start) return;

      const [x, w] = start.x < e.x
        ? [start.x, e.x - start.x]
        : [e.x, start.x - e.x];
      const [y, h] = start.y < e.y
        ? [start.y, e.y - start.y]
        : [e.y, start.y - e.y];

      if (h * w > 4) {
        addNodeFromCanvas({
          id: ulid(),
          name: "Rectangle",
          type: "rectangle",
          topLeft: { x, y },
          bottomRight: { x: x + w, y: y + h },
          radius: 6,
          strokeColour: "#c75249",
        });
      }
    }

    if (mode() === "line") {
      const start = startPoint();
      if (!start) return;

      const [x, w] = start.x < e.x
        ? [start.x, e.x - start.x]
        : [e.x, start.x - e.x];
      const [y, h] = start.y < e.y
        ? [start.y, e.y - start.y]
        : [e.y, start.y - e.y];

      addNodeFromCanvas({
        id: ulid(),
        name: "Line",
        type: "line",
        topLeft: { x, y },
        bottomRight: { x: x + w, y: y + h },
        start: { x: start.x, y: start.y },
        end: { x: e.x, y: e.y },
        strokeColour: "#c75249",
      });
    }

    setStartPoint(undefined);
    editingContext()?.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  return (
    <div
      class="relative h-screen w-full bg-canvas"
      // eslint-disable-next-line click-events-have-key-events
      onClick={clickHandler}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
      onWheel={wheelHandler}
    >
      <canvas
        ref={canvas}
        class="h-full w-full"
        height={window.innerHeight}
        width={window.innerWidth}
      >
      </canvas>
      <canvas
        ref={editingCanvas}
        class="absolute top-0 left-0 h-full w-full"
        height={window.innerHeight}
        width={window.innerWidth}
      >
      </canvas>
      <div
        ref={editingDiv}
        class={cls(
          "absolute top-0 left-0 h-full w-full",
          mode() === "hand" && "cursor-grab",
          mode() === "hand" && startPoint() && "cursor-grabbing",
        )}
      >
      </div>
      <div class="absolute top-4 left-4 w-fit">
        <div
          class="py-2 px-2 flex flex-col gap-2 rounded-md bg-white shadow-sm"
          // eslint-disable-next-line click-events-have-key-events
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div class="px-2 flex gap-2 items-center">
            <LayersIcon />
            <span class="text-[#524319]">Hierarchy</span>
          </div>
          <div class="flex-col gap-1">
            <For each={nodes()}>
              {(node) => (
                <div class="px-2 py-1 flex gap-1 items-center">
                  {node.type === "text"
                    ? <TypeIcon />
                    : node.type === "rectangle"
                    ? <SquareIcon />
                    : <SlashIcon />}
                  <span class="text-[#9f8f65]">{node.name}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <header class="absolute top-4 left-4 right-4 flex justify-center max-lg:justify-start">
        <div
          class="py-2 px-4 flex gap-12 items-center rounded-md bg-white shadow-sm"
          // eslint-disable-next-line click-events-have-key-events
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div class="flex gap-2 items-center">
            <img
              src="/src/assets/logo.png"
              alt="Whiteboard logo"
              class="h-5 w-5 object-contain"
            />
            <span class="text-lg font-medium text-[#c75249]">
              Whiteboard
            </span>
          </div>
          <div class="flex gap-1">
            <IconButton
              selected={mode() === "mouse"}
              onClick={() => setMode("mouse")}
            >
              <MousePointerIcon />
            </IconButton>
            <IconButton
              selected={mode() === "hand"}
              onClick={() => setMode("hand")}
            >
              <HandIcon />
            </IconButton>
            <IconButton
              selected={mode() === "type"}
              onClick={() => setMode("type")}
            >
              <TypeIcon />
            </IconButton>
            <IconButton
              selected={mode() === "square"}
              onClick={() => setMode("square")}
            >
              <SquareIcon />
            </IconButton>
            <IconButton
              selected={mode() === "line"}
              onClick={() => setMode("line")}
            >
              <SlashIcon />
            </IconButton>
            <IconButton
              selected={mode() === "table"}
              onClick={() => setMode("table")}
            >
              <TableIcon />
            </IconButton>
          </div>
        </div>
      </header>
      <div class="absolute z-10 top-4 right-4">
        <div
          class="py-2 px-4 flex gap-2 items-center rounded-md bg-white shadow-sm"
          // eslint-disable-next-line click-events-have-key-events
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <SearchIcon />
          <input placeholder="Search" />
        </div>
      </div>
    </div>
  );
}
