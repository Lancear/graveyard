import type { Accessor, Setter } from "solid-js";
import type { InputMode } from "../logic/inputs.ts";
import {
  HandIcon,
  IconButton,
  MousePointerIcon,
  SlashIcon,
  SquareIcon,
  TypeIcon,
} from "./icons.tsx";

interface ToolbarProps {
  inputMode: Accessor<InputMode>;
  setInputMode: Setter<InputMode>;
}

export function Toolbar(props: ToolbarProps) {
  return (
    <div
      class="py-2 px-4 flex gap-12 items-center rounded-md bg-white shadow-sm"
      // eslint-disable-next-line click-events-have-key-events
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
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
          selected={props.inputMode() === "select"}
          onClick={() => props.setInputMode("select")}
        >
          <MousePointerIcon />
        </IconButton>
        <IconButton
          selected={props.inputMode() === "move"}
          onClick={() => props.setInputMode("move")}
        >
          <HandIcon />
        </IconButton>
        <IconButton
          selected={props.inputMode() === "text"}
          onClick={() => props.setInputMode("text")}
        >
          <TypeIcon />
        </IconButton>
        <IconButton
          selected={props.inputMode() === "rectangle"}
          onClick={() => props.setInputMode("rectangle")}
        >
          <SquareIcon />
        </IconButton>
        <IconButton
          selected={props.inputMode() === "line"}
          onClick={() => props.setInputMode("line")}
        >
          <SlashIcon />
        </IconButton>
        {
          /* <IconButton
          selected={props.inputMode() === "table"}
          onClick={() => props.setInputMode("table")}
        >
          <TableIcon />
        </IconButton> */
        }
      </div>
    </div>
  );
}
