import { createEffect, For } from "solid-js";
import {
  LayersIcon,
  SearchIcon,
  SlashIcon,
  SquareIcon,
  TypeIcon,
} from "./components/icons.tsx";
import { Toolbar } from "./components/toolbar.tsx";
import { Zoombar } from "./components/zoombar.tsx";
import { createInputState, getHandlers, zoom } from "./logic/inputs.ts";
import { createRendererState } from "./logic/renderer.ts";
import {
  createWhiteboardState,
  getNodeScreenSize,
  toScreenPoint,
} from "./logic/whiteboard.ts";
import { cls } from "./utils.ts";

export function Page() {
  const whiteboard = createWhiteboardState();
  const input = createInputState();
  const renderer = createRendererState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const handlers = getHandlers({ whiteboard, renderer, input });

  createEffect(function drawNodes() {
    const ctx = renderer.shapeLayer();
    if (!ctx) return;

    const rendererSize = renderer.size();
    ctx.clearRect(0, 0, rendererSize.w, rendererSize.h);

    while (renderer.textLayer.ref?.firstChild) {
      renderer.textLayer.ref.removeChild(renderer.textLayer.ref.firstChild);
    }

    for (const node of whiteboard.nodes()) {
      if (node.type === "rectangle") {
        const topLeft = toScreenPoint(whiteboard, node.topLeft);
        const { w, h } = getNodeScreenSize(whiteboard, node);

        ctx.beginPath();
        ctx.roundRect(topLeft.x, topLeft.y, w, h);
        ctx.stroke();
      }

      if (node.type === "line") {
        const start = toScreenPoint(whiteboard, node.start);
        const end = toScreenPoint(whiteboard, node.end);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      if (node.type === "text") {
        const topLeft = toScreenPoint(whiteboard, node.topLeft);

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
        renderer.textLayer.ref?.appendChild(input);
      }
    }
  });

  return (
    <div
      class="relative h-screen w-full bg-canvas select-none"
      {...handlers}
    >
      <canvas
        ref={renderer.shapeCanvas.ref}
        class="h-full w-full"
        width={renderer.size().w}
        height={renderer.size().h}
      >
      </canvas>
      <canvas
        ref={renderer.shapeEditingCanvas.ref}
        class="absolute top-0 left-0 h-full w-full"
        width={renderer.size().w}
        height={renderer.size().h}
      >
      </canvas>
      <div
        ref={renderer.textLayer.ref}
        class={cls(
          "absolute top-0 left-0 h-full w-full",
          input.inputMode() === "move" && "cursor-grab",
          input.inputMode() === "move" && input.mouseDownEvent() &&
            "cursor-grabbing",
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
            <For each={whiteboard.nodes()}>
              {(node) => (
                <div class="px-2 py-1 flex gap-1 items-center">
                  {node.type === "text"
                    ? <TypeIcon class="h-3 w-3 stroke-[#9f8f65]" />
                    : node.type === "rectangle"
                    ? <SquareIcon class="h-3 w-3 stroke-[#9f8f65]" />
                    : <SlashIcon class="h-3 w-3 stroke-[#9f8f65]" />}
                  <span class="text-[#9f8f65]">{node.name}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <header class="absolute top-4 left-4 right-4 flex justify-center max-lg:justify-start">
        <Toolbar
          inputMode={input.inputMode}
          setInputMode={input.setInputMode}
        />
      </header>
      <div class="absolute z-10 top-4 right-4">
        <div
          class="py-2 px-4 flex gap-2 items-center rounded-md bg-white shadow-sm"
          // eslint-disable-next-line click-events-have-key-events
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <SearchIcon class="stroke-[#9f8f65]" />
          <input placeholder="Search" />
        </div>
      </div>
      <div class="absolute z-10 bottom-4 right-4">
        <Zoombar
          zoom={whiteboard.zoom}
          zoomIn={() => zoom({ whiteboard, renderer }, 0.1)}
          zoomOut={() => zoom({ whiteboard, renderer }, -0.1)}
        />
      </div>
    </div>
  );
}
