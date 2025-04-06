import type { Accessor } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import type { Size } from "../domain.ts";
import { createRef, type RefContainer } from "./solid.ts";

export function createCanvasContextRef() {
  let canvas = createRef<HTMLCanvasElement>();
  const [context, setContext] = createSignal<
    CanvasRenderingContext2D | undefined
  >(
    undefined,
  );

  createEffect(() => {
    const ctx = canvas.ref?.getContext("2d");
    if (ctx) setContext(ctx);
  });

  return [canvas, context] as [
    RefContainer<HTMLCanvasElement | undefined>,
    Accessor<CanvasRenderingContext2D | undefined>,
  ];
}

export interface RendererState {
  size: Accessor<Size>;
  shapeLayer: Accessor<CanvasRenderingContext2D | undefined>;
  shapeEditingLayer: Accessor<CanvasRenderingContext2D | undefined>;
  textLayer: RefContainer<HTMLDivElement | undefined>;
  shapeCanvas: RefContainer<HTMLCanvasElement | undefined>;
  shapeEditingCanvas: RefContainer<HTMLCanvasElement | undefined>;
}

export function createRendererState(initialSize: Size) {
  const [shapeCanvas, shapeLayer] = createCanvasContextRef();
  const [shapeEditingCanvas, shapeEditingLayer] = createCanvasContextRef();
  const textLayer = createRef<HTMLDivElement>();

  const [size, setSize] = createSignal(initialSize);

  createEffect(() => {
    function onResize() {
      const newSize = { w: window.innerWidth, h: window.innerHeight };

      if (shapeCanvas.ref) {
        shapeCanvas.ref.height = newSize.h;
        shapeCanvas.ref.width = newSize.w;
      }

      if (shapeEditingCanvas.ref) {
        shapeEditingCanvas.ref.height = newSize.h;
        shapeEditingCanvas.ref.width = newSize.w;
      }

      setSize(newSize);
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  return {
    size,
    shapeLayer,
    shapeEditingLayer,
    textLayer,
    shapeCanvas,
    shapeEditingCanvas,
  };
}
