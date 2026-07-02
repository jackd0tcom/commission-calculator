// src/hooks/useFloatingDropdown.ts
import { useState, useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  shift,
  size,
  offset,
  FloatingPortal,
} from "@floating-ui/react";

type Options = {
  boundaryRef?: React.RefObject<HTMLElement | null>;
  offsetPx?: number;
  maxHeight?: number;
  minHeight?: number;
};

export function useFloatingDropdown({
  boundaryRef,
  offsetPx = 4,
  maxHeight = 300,
  minHeight = 200,
}: Options = {}) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate, // repositions on scroll/resize
    middleware: [
      offset(offsetPx),
      size({
        boundary: boundaryRef?.current ?? "clippingAncestors",
        padding: 8,
        apply({ availableHeight, elements }) {
          const height = Math.min(
            maxHeight,
            Math.max(minHeight, availableHeight),
          );
          elements.floating.style.maxHeight = `${height}px`;
        },
      }),
      flip({
        boundary: boundaryRef?.current ?? "clippingAncestors",
        fallbackPlacements: ["top-start", "bottom-start"],
        fallbackStrategy: "initialPlacement",
        padding: 0,
      }),
      shift({ padding: 8 }),
    ],
  });

  // keep your existing click-outside pattern, but use refs.setFloating
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        refs.domReference.current?.contains(target) ||
        refs.floating.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, refs]);

  return {
    open,
    setOpen,
    referenceRef: refs.setReference,
    floatingRef: refs.setFloating,
    floatingStyles,
    FloatingPortal,
    context,
  };
}
