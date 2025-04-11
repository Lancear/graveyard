import { createEffect, createResource, Index } from "solid-js";
import { fetchWhiteboard, saveWhiteboardNodes } from "./api.ts";
import { Editbar } from "./components/editbar.tsx";
import { SearchIcon } from "./components/icons.tsx";
import { RenderedNode } from "./components/rendered-node.tsx";
import { Toolbar } from "./components/toolbar.tsx";
import { Zoombar } from "./components/zoombar.tsx";
import { createInputState, getHandlers, zoom } from "./logic/inputs.ts";
import { createRendererState } from "./logic/renderer.ts";
import { createWhiteboardState } from "./logic/whiteboard.ts";
import { cls } from "./utils.ts";

const WHITEBOARD_ID = "01JR5WSSH9FWM7H36W4C3D8WZY";

export function Page() {
  const whiteboard = createWhiteboardState();
  const input = createInputState();
  const renderer = createRendererState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const handlers = getHandlers({ whiteboard, renderer, input });

  const [savedWhiteboard] = createResource(WHITEBOARD_ID, fetchWhiteboard);

  createEffect(() => {
    const savedNodes = savedWhiteboard()?.nodes;
    if (savedNodes) whiteboard.setNodes(savedNodes);
  });

  createEffect(() => {
    try {
      const state = localStorage.getItem(
        `/whiteboards/${WHITEBOARD_ID}/localState`,
      );

      if (state) {
        const { zoom, offset } = JSON.parse(state);
        whiteboard.setZoom(zoom);
        whiteboard.setOffset(offset);
      }
    } catch (err) {
      console.error("Failed to load local whiteboard state", err);
    }
  });

  createEffect(() => {
    try {
      const zoom = whiteboard.zoom();
      const offset = whiteboard.offset();
      localStorage.setItem(
        `/whiteboards/${WHITEBOARD_ID}/localState`,
        JSON.stringify({ zoom, offset }),
      );
    } catch (err) {
      console.error("Failed to save local whiteboard state", err);
    }
  });

  return (
    <div
      class="relative h-screen w-full overflow-hidden bg-canvas select-none"
      {...handlers}
    >
      <canvas
        ref={renderer.shapeEditingCanvas.ref}
        class="absolute top-0 left-0 h-full w-full"
        width={renderer.size().w}
        height={renderer.size().h}
      />
      <div
        class={cls(
          "absolute top-0 left-0 h-full w-full cursor-default",
          input.inputMode() === "move" && "cursor-grab",
          input.inputMode() === "move" && input.mouseDownEvent() &&
            "cursor-grabbing",
        )}
      >
        <Index each={whiteboard.nodes()}>
          {(node) => (
            <RenderedNode
              whiteboard={whiteboard}
              input={input}
              node={node}
              selected={() => input.selectedNodeIds().includes(node().nodeId)}
            />
          )}
        </Index>
        <Editbar />
      </div>
      {
        /* <div class="absolute top-4 left-4 w-fit">
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
            <For each={whiteboard.nodes().toReversed()}>
              {(node) => (
                <div class="px-2 py-1 flex gap-1 items-center">
                  {node.type === "text"
                    ? <TypeIcon class="h-3 w-3 stroke-[#9f8f65]" />
                    : node.type === "rectangle"
                    ? <SquareIcon class="h-3 w-3 stroke-[#9f8f65]" />
                    : <SlashIcon class="h-3 w-3 stroke-[#9f8f65]" />}
                  <span
                    class={cls(
                      !input.selectedNodeIds().includes(node.nodeId) &&
                        "text-[#8f8676]",
                    )}
                  >
                    {node.name}
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div> */
      }
      <header class="absolute top-4 left-4 right-4 flex justify-center max-lg:justify-start">
        <Toolbar
          inputMode={input.inputMode}
          setInputMode={input.setInputMode}
          save={() => {
            const nodes = whiteboard.nodes();
            saveWhiteboardNodes(WHITEBOARD_ID, nodes);
          }}
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
