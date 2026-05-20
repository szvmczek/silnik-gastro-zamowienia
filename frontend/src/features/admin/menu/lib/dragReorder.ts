import { useState } from "react";
import type { DragEvent } from "react";

// M-042 — native HTML5 drag-and-drop reorder for vertical lists.
// Zero-dependency (N43 A). Keyboard-a11y reorder deferred — PHASE5_FINDINGS #26.
//
// Whole row is draggable; the ⋮⋮ handle is the visual affordance. onCommit
// receives the reordered array — caller persists (recompute displayOrder,
// PUT changed rows, optimistic + rollback).

export interface DragRowProps {
  draggable?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
}

export interface DragReorder {
  getRowProps: (index: number) => DragRowProps;
  dragIndex: number | null;
  overIndex: number | null;
}

export function useDragReorder<T>(
  items: T[],
  onCommit: (reordered: T[]) => void,
  enabled = true,
): DragReorder {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const getRowProps = (index: number): DragRowProps => {
    if (!enabled) return {};
    return {
      draggable: true,
      onDragStart: (e) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Firefox requires data to be set for the drag to start.
        e.dataTransfer.setData("text/plain", String(index));
      },
      onDragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overIndex !== index) setOverIndex(index);
      },
      onDrop: (e) => {
        e.preventDefault();
        const from = dragIndex;
        reset();
        if (from === null || from === index) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(index, 0, moved);
        onCommit(next);
      },
      onDragEnd: reset,
    };
  };

  return { getRowProps, dragIndex, overIndex };
}
