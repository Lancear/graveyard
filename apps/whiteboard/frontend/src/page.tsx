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
  getRectangleSize,
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

    const nodes = whiteboard.nodes();
    const selectedNodeIds = input.selectedNodeIds();
    const rendererSize = renderer.size();

    ctx.clearRect(0, 0, rendererSize.w, rendererSize.h);
    ctx.strokeStyle = "#524319";

    while (renderer.textLayer.ref?.firstChild) {
      renderer.textLayer.ref.removeChild(renderer.textLayer.ref.firstChild);
    }

    for (const node of nodes) {
      if (node.type === "rectangle") {
        const topLeft = toScreenPoint(whiteboard, node.topLeft);
        const { w, h } = getNodeScreenSize(whiteboard, node);

        if (selectedNodeIds.includes(node.id)) {
          ctx.strokeStyle = "#c75249";
        }

        ctx.beginPath();
        ctx.roundRect(topLeft.x, topLeft.y, w, h);
        ctx.stroke();
        ctx.strokeStyle = "#524319";
      }

      if (node.type === "line") {
        const start = toScreenPoint(whiteboard, node.start);
        const end = toScreenPoint(whiteboard, node.end);

        if (selectedNodeIds.includes(node.id)) {
          ctx.strokeStyle = "#c75249";
        }

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.strokeStyle = "#524319";
      }

      if (node.type === "text") {
        const topLeft = toScreenPoint(whiteboard, node.topLeft);
        const size = getRectangleSize(node.topLeft, node.bottomRight);

        const textInput = document.createElement("textarea");
        textInput.addEventListener("click", (e) => e.stopPropagation());
        textInput.addEventListener("mouseup", (e) => e.stopPropagation());
        textInput.addEventListener("mousedown", (e) => e.stopPropagation());
        textInput.addEventListener("wheel", (e) => e.stopPropagation());
        textInput.addEventListener("blur", () => {
          if (!textInput.value) {
            textInput.remove();
            whiteboard.setNodes((old) => old.filter((n) => n.id !== node.id));
          } else {
            const rect = textInput.getBoundingClientRect();

            whiteboard.setNodes((old) =>
              old.map((n) => {
                if (n.id !== node.id) return n;
                return {
                  ...n,
                  name: textInput.value,
                  markdown: textInput.value,
                  bottomRight: { x: rect.right, y: rect.bottom },
                };
              })
            );
          }
        });

        textInput.placeholder = "Insert Text";
        textInput.className =
          "resize-none focus:resize h-9 w-24 px-2 py-1 rounded border border-dashed border-transparent focus:border-[#d0b465cc] focus:outline-none origin-top-left";
        textInput.style.position = "absolute";
        textInput.style.top = topLeft.y + "px";
        textInput.style.left = topLeft.x + "px";
        textInput.style.width = size.w + "px";
        textInput.style.height = size.h + "px";
        textInput.style.transform = "scale(" + whiteboard.zoom() + ")";
        textInput.value = node.markdown;
        renderer.textLayer.ref?.appendChild(textInput);

        if (selectedNodeIds.includes(node.id)) {
          textInput.focus();
        }
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
                  <span
                    class={cls(
                      !input.selectedNodeIds().includes(node.id) &&
                        "text-[#9f8f65]",
                    )}
                  >
                    {node.name}
                  </span>
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
