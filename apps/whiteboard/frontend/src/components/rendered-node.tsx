import { type Accessor, Match, Switch } from "solid-js";
import type {
  LineNode,
  RectangleNode,
  TextNode,
  WhiteboardNode,
} from "../domain.ts";
import { type InputState } from "../logic/inputs.ts";
import { toScreenPoint, type WhiteboardState } from "../logic/whiteboard.ts";
import { cls, px } from "../utils.ts";

export interface RenderedNodeProps<
  Node extends WhiteboardNode = WhiteboardNode,
> {
  whiteboard: WhiteboardState;
  input: InputState;
  node: Accessor<Node>;
  selected?: Accessor<boolean>;
}

export function RenderedNode(props: RenderedNodeProps) {
  return (
    <Switch>
      <Match when={props.node().type === "rectangle"}>
        <RenderedRectangleNode
          whiteboard={props.whiteboard}
          input={props.input}
          node={props.node as Accessor<RectangleNode>}
          selected={props.selected}
        />
      </Match>
      <Match when={props.node().type === "line"}>
        <RenderedLineNode
          whiteboard={props.whiteboard}
          input={props.input}
          node={props.node as Accessor<LineNode>}
          selected={props.selected}
        />
      </Match>
      <Match when={true}>
        <RenderedTextNode
          whiteboard={props.whiteboard}
          input={props.input}
          node={props.node as Accessor<TextNode>}
          selected={props.selected}
        />
      </Match>
    </Switch>
  );
}

function RenderedRectangleNode(props: RenderedNodeProps<RectangleNode>) {
  const topLeft = () => toScreenPoint(props.whiteboard, props.node().topLeft);
  const bottomRight = () =>
    toScreenPoint(props.whiteboard, props.node().bottomRight);

  return (
    <div
      style={{
        position: "absolute",
        top: px(topLeft().y),
        left: px(topLeft().x),
        height: px(bottomRight().y - topLeft().y),
        width: px(bottomRight().x - topLeft().x),
        "border-style": "solid",
        "border-color": props.selected?.() ? "#c75249" : "#524319",
        "border-width": px(2),
      }}
      // eslint-disable-next-line click-events-have-key-events
      onClick={() => props.input.setSelectedNodeIds([props.node().nodeId])}
    />
  );
}

function RenderedLineNode(props: RenderedNodeProps<LineNode>) {
  const start = () => toScreenPoint(props.whiteboard, props.node().start);
  const end = () => toScreenPoint(props.whiteboard, props.node().end);

  return (
    <div
      style={{
        position: "absolute",
        top: px(start().y),
        left: px(start().x),
        width: px(
          Math.sqrt(
            (end().y - start().y) ** 2 +
              (end().x - start().x) ** 2,
          ),
        ),
        "transform-origin": "top left",
        transform: `rotate(${
          Math.atan2(end().y - start().y, end().x - start().x)
        }rad)`,
        "border-style": "solid",
        "border-color": props.selected?.() ? "#c75249" : "#524319",
        "border-top-width": px(2),
      }}
      // eslint-disable-next-line click-events-have-key-events
      onClick={() => props.input.setSelectedNodeIds([props.node().nodeId])}
    />
  );
}

function RenderedTextNode(props: RenderedNodeProps<TextNode>) {
  const topLeft = () => toScreenPoint(props.whiteboard, props.node().topLeft);

  return (
    <textarea
      placeholder="Insert Text"
      style={{
        position: "absolute",
        top: px(topLeft().y),
        left: px(topLeft().x),
        height: px(props.node().bottomRight.y - props.node().topLeft.y),
        width: px(props.node().bottomRight.x - props.node().topLeft.x),
        "transform-origin": "top left",
        transform: `scale(${props.whiteboard.zoom()})`,
      }}
      class={cls(
        "resize-none focus:resize h-9 w-24 px-2 py-1 rounded border border-dashed border-transparent focus:border-[#d0b465cc] cursor-[inherit] focus:cursor-text",
        props.selected?.() && "border-[#c75249]",
      )}
      // eslint-disable-next-line click-events-have-key-events
      onClick={() => props.input.setSelectedNodeIds([props.node().nodeId])}
      onBlur={(e) => {
        if (!e.target.value) {
          props.whiteboard.setNodes((old) =>
            old.filter((n) => n.nodeId !== props.node().nodeId)
          );
        } else {
          const rect = e.target.getBoundingClientRect();

          props.input.setSelectedNodeIds([]);
          props.whiteboard.setNodes((old) =>
            old.map((n) => {
              if (n.nodeId !== props.node().nodeId) return n;
              return {
                ...n,
                name: e.target.value,
                markdown: e.target.value,
                bottomRight: { x: rect.right, y: rect.bottom },
              };
            })
          );
        }
      }}
    >
      {props.node().markdown}
    </textarea>
  );
}
