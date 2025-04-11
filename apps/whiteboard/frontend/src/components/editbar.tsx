import {
  type Component,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { cls } from "../utils.ts";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  DashedIcon,
  DropletIcon,
  EllipsisIcon,
  IconButton,
  type IconProps,
  LayoutPanelLeftIcon,
  MinusIcon,
  MoveHorizontalIcon,
  MoveVerticalIcon,
  PaintBrushIcon,
  PaintBucketIcon,
  PencilIcon,
  RotateCwSquareIcon,
  SplineIcon,
  SquareDashedIcon,
  TrashIcon,
  TriangleIcon,
} from "./icons.tsx";

export function Editbar() {
  const [selectedTab, setSelectedTab] = createSignal<
    "fill" | "line" | "arrows" | "radius" | "layout"
  >();

  return (
    <div class="absolute z-10 top-64 left-64 rounded-md text-sm bg-white shadow-sm cursor-auto">
      <div class="py-1 px-1 flex gap-1 items-center">
        <div class="py-1 px-2 flex gap-1 items-center rounded hover:bg-[#f1ebea] cursor-pointer transition-all">
          <input type="text" value="" placeholder="Name" />
          <PencilIcon class="h-3.5 w-3.5" />
        </div>
        <div class="grow-1 px-1 flex gap-1 items-center border-r border-l border-[#f1ebea]">
          <TabButton
            selected={selectedTab() === "fill"}
            onClick={() => setSelectedTab("fill")}
            icon={PaintBucketIcon}
            text="Fill"
          />
          <TabButton
            selected={selectedTab() === "line"}
            onClick={() => setSelectedTab("line")}
            icon={PaintBrushIcon}
            text="Line"
          />
          <TabButton
            selected={selectedTab() === "radius"}
            onClick={() => setSelectedTab("radius")}
            icon={SplineIcon}
            text="Radius"
          />
          <TabButton
            selected={selectedTab() === "layout"}
            onClick={() => setSelectedTab("layout")}
            icon={LayoutPanelLeftIcon}
            text="Layout"
          />
          <TabButton
            selected={selectedTab() === "arrows"}
            onClick={() => setSelectedTab("arrows")}
            icon={MoveHorizontalIcon}
            text="Arrows"
          />
        </div>
        <IconButton>
          <TrashIcon class="h-3.5 w-3.5 stroke-[#c75249]" />
        </IconButton>
      </div>
      <Show when={selectedTab()}>
        <div class="py-1 pl-3 pr-1 flex gap-3 items-center border-t border-[#f1ebea]">
          <Switch>
            <Match when={selectedTab() === "fill"}>
              <div class="flex gap-2 items-center">
                <span class="text-[#8f8676]">Colour</span>
                <ColorPicker value="#c75249" />
              </div>
              <div class="pl-3 flex gap-2 items-center border-l border-[#f1ebea]">
                <span class="text-[#8f8676]">Opacity</span>
                <NumberInput
                  value={0}
                  icon={SquareDashedIcon}
                  placeholder="%"
                  class="w-16"
                />
              </div>
            </Match>
            <Match when={selectedTab() === "line"}>
              <div class="flex gap-2 items-center">
                <span class="text-[#8f8676]">Thickness</span>
                <NumberInput
                  value={2}
                  icon={MoveVerticalIcon}
                  placeholder="px"
                  class="w-14"
                />
              </div>
              <div class="pl-3 flex gap-2 items-center border-l border-[#f1ebea]">
                <span class="text-[#8f8676]">Pattern</span>
                <Select
                  options={[
                    { value: "solid", icon: MinusIcon, text: "Solid" },
                    {
                      value: "dashed",
                      icon: DashedIcon,
                      text: "Dashed",
                    },
                    { value: "dotted", icon: EllipsisIcon, text: "Dotted" },
                  ]}
                  value="solid"
                  class="w-24"
                />
              </div>
              <div class="pl-3 flex gap-2 items-center border-l border-[#f1ebea]">
                <span class="text-[#8f8676]">Colour</span>
                <ColorPicker value="#c75249" />
              </div>
              <div class="pl-3 flex gap-2 items-center border-l border-[#f1ebea]">
                <span class="text-[#8f8676]">Opacity</span>
                <NumberInput
                  value={100}
                  icon={SquareDashedIcon}
                  placeholder="%"
                  class="w-16"
                />
              </div>
            </Match>
            <Match when={selectedTab() === "radius"}>
              <div class="flex gap-2 items-center">
                <span class="text-[#8f8676]">All Corners</span>
                <NumberInput
                  value={0}
                  icon={SplineIcon}
                  placeholder="px"
                  class="w-14"
                />
              </div>
              <div class="pl-3 flex gap-2 items-center border-l border-[#f1ebea]">
                <span class="text-[#8f8676]">Individual</span>
                <div class="flex gap-1 items-center">
                  <NumberInput
                    value={0}
                    icon={RotateCwSquareIcon}
                    placeholder="px"
                    class="w-14"
                  />
                  <NumberInput
                    value={0}
                    icon={(props) => (
                      <RotateCwSquareIcon
                        class={cls("rotate-90", props.class)}
                      />
                    )}
                    placeholder="px"
                    class="w-14"
                  />
                  <NumberInput
                    value={0}
                    icon={(props) => (
                      <RotateCwSquareIcon
                        class={cls("rotate-180", props.class)}
                      />
                    )}
                    placeholder="px"
                    class="w-14"
                  />
                  <NumberInput
                    value={0}
                    icon={(props) => (
                      <RotateCwSquareIcon
                        class={cls("rotate-270", props.class)}
                      />
                    )}
                    placeholder="px"
                    class="w-14"
                  />
                </div>
              </div>
            </Match>
            <Match when={selectedTab() === "arrows"}>
              <div class="flex gap-2 items-center">
                <span class="text-[#8f8676]">Start</span>
                <Select
                  value="none"
                  options={[
                    { value: "none", icon: MinusIcon, text: "None" },
                    {
                      value: "arrow",
                      icon: ArrowLeftIcon,
                      text: "Arrow",
                    },
                    {
                      value: "triangle",
                      icon: (props) => (
                        <TriangleIcon
                          class={cls("-rotate-90", props.class)}
                          style={props.style}
                        />
                      ),
                      text: "Triangle",
                    },
                  ]}
                />
              </div>
              <div class="pl-3 flex gap-2 items-center border-l border-[#f1ebea]">
                <span class="text-[#8f8676]">End</span>
                <Select
                  value="triangle"
                  options={[
                    { value: "none", icon: MinusIcon, text: "None" },
                    {
                      value: "arrow",
                      icon: ArrowRightIcon,
                      text: "Arrow",
                    },
                    {
                      value: "triangle",
                      icon: (props) => (
                        <TriangleIcon
                          class={cls("rotate-90", props.class)}
                          style={props.style}
                        />
                      ),
                      text: "Triangle",
                    },
                  ]}
                />
              </div>
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  );
}

export interface TabButtonProps {
  icon: Component<IconProps>;
  text: string;
  onClick?(this: void): void;
  selected?: boolean;
  class?: string;
}

export function TabButton(props: TabButtonProps) {
  return (
    <button
      class={cls(
        "py-1 px-2 flex gap-1.5 items-center rounded hover:bg-[#f1ebea] cursor-pointer transition-all",
        props.selected && "bg-[#f4e5dc]",
        props.class,
      )}
      onClick={props.onClick}
    >
      <Dynamic component={props.icon} class="shrink-0 h-3.5 w-3.5" />
      <span>{props.text}</span>
    </button>
  );
}

export interface ColorPickerProps {
  value?: string;
  class?: string;
}

export function ColorPicker(props: ColorPickerProps) {
  const [optionsOpen, setOptionsOpen] = createSignal();
  const options = [
    // "#fbf9f9",
    // "#f1ebea",
    // "#f4e5dc",
    "#dcab8e",
    "#c75249",
    "#524319",
    "#9f8f65",
  ];

  return (
    <div class="relative">
      <div
        class={cls(
          "py-1 px-2 flex gap-2 items-center justify-between rounded bg-[#fbf9f9] hover:bg-[#f1ebea] cursor-pointer transition-all",
          optionsOpen() && "bg-[#f1ebea]",
          props.class,
        )}
        onClick={() => setOptionsOpen((old) => !old)}
        onKeyPress={() => setOptionsOpen((old) => !old)}
      >
        <DropletIcon
          style={{ fill: props.value, stroke: props.value }}
          class="shrink-0 h-4 w-4"
        />
        <ChevronDownIcon class="shrink-0 h-3.5 w-3.5" />
      </div>
      <Show when={optionsOpen()}>
        <div class="w-max absolute top-full left-0 pt-0.5">
          <div class="p-1 grid grid-cols-4 gap-0.5 rounded bg-white shadow-sm">
            <For each={options}>
              {(option) => (
                <IconButton
                  selected={option === props.value}
                  size="sm"
                >
                  <DropletIcon
                    style={{ fill: option, stroke: option }}
                    class="shrink-0 h-4 w-4"
                  />
                </IconButton>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

export interface NumberInputProps {
  icon?: Component<IconProps>;
  placeholder?: string;
  value?: number;
  onChange?(this: void, value: number): void;
  class?: string;
}

export function NumberInput(props: NumberInputProps) {
  return (
    <div
      class={cls(
        "py-1 px-2 flex gap-1 items-center rounded bg-[#fbf9f9] hover:bg-[#f1ebea] focus-within:bg-[#f1ebea] transition-all",
        props.class,
      )}
    >
      {props.icon && (
        <Dynamic component={props.icon} class="shrink-0 h-3.5 w-3.5" />
      )}
      <input
        type="text"
        value={props.value ?? ""}
        placeholder={props.placeholder}
        incremental={false}
        class="w-full text-end placeholder:text-end"
      />
    </div>
  );
}

export interface SelectOptionProps {
  value?: string;
  icon?: Component<IconProps>;
  text?: string;
  selected?: boolean;
  class?: string;
  onClick?(this: void): void;
}

export function SelectOption(props: SelectOptionProps) {
  return (
    <div
      class={cls(
        "py-1 px-2 flex gap-2 items-center justify-between rounded hover:bg-[#f1ebea] cursor-pointer transition-all",
        props.selected && "bg-[#fbf9f9]",
        props.class,
      )}
      onClick={props.onClick}
      onKeyPress={props.onClick}
    >
      <div class="flex gap-1 items-center">
        {props.icon && (
          <Dynamic component={props.icon} class="shrink-0 h-3.5 w-3.5" />
        )}
        <span>{props.text ?? props.value ?? "Unselected"}</span>
      </div>
      {props.selected &&
        <ChevronDownIcon class="shrink-0 h-3.5 w-3.5" />}
    </div>
  );
}

export interface SelectProps {
  options: SelectOptionProps[];
  value?: string;
  onChange?(this: void, value: string): void;
  class?: string;
}

export function Select(props: SelectProps) {
  const [optionsOpen, setOptionsOpen] = createSignal();

  const selectedOption = () =>
    props.options.find((p) => p.value === props.value);

  return (
    <div class="relative">
      <SelectOption
        class={cls(
          optionsOpen() && "bg-[#f1ebea]",
          props.class,
        )}
        value={props.value}
        icon={selectedOption()?.icon}
        text={selectedOption()?.text}
        selected
        onClick={() => setOptionsOpen((old) => !old)}
      />
      <Show when={optionsOpen()}>
        <div class="w-full absolute top-full left-0 pt-0.5">
          <div class="p-1 flex flex-col gap-0.5 rounded bg-white shadow-sm">
            <For each={props.options}>
              {(option) =>
                option.value === props.value ? undefined : (
                  <SelectOption
                    value={option.value}
                    icon={option.icon}
                    text={option.text}
                  />
                )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
