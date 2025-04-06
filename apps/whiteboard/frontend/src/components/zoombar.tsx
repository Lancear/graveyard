import type { Accessor } from "solid-js";
import { IconButton, ZoomInIcon, ZoomOutIcon } from "./icons.tsx";

interface ZoombarProps {
  zoom: Accessor<number>;
  zoomIn(): void;
  zoomOut(): void;
}

export function Zoombar(props: ZoombarProps) {
  return (
    <div
      class="py-2 pl-4 pr-2 flex gap-4 items-center rounded-md bg-white shadow-sm"
      // eslint-disable-next-line click-events-have-key-events
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <span class="inline-block w-7 text-end font-medium text-[#524319]">
        {props.zoom() + "x"}
      </span>
      <div class="flex gap-1">
        <IconButton onClick={props.zoomIn}>
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={props.zoomOut}>
          <ZoomOutIcon />
        </IconButton>
      </div>
    </div>
  );
}
