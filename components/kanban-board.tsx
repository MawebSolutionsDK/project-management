"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Avatar } from "./avatar";
import type { BadgeTone } from "@/lib/types";

export type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  metaTone?: "danger" | "warning" | null;
  status: string;
  tone?: BadgeTone;
};

export type KanbanColumnDef = {
  value: string;
  label: string;
  tone?: BadgeTone;
};

const TONE_BORDER: Record<BadgeTone, string> = {
  neutral: "border-l-ink/20",
  info: "border-l-accent",
  success: "border-l-teal",
  warning: "border-l-gold",
  danger: "border-l-rust",
};

const TONE_DOT: Record<BadgeTone, string> = {
  neutral: "bg-ink/30",
  info: "bg-accent",
  success: "bg-teal",
  warning: "bg-gold",
  danger: "bg-rust",
};

// Generisk Kanban-board genbrugt af Leads/Projekter/Support. Data hentes server-side af
// den kaldende side; onStatusChange er en "use server"-handling der sendes direkte ind
// som prop (understøttet i Next.js App Router) og kaldes ved drop, uden en formular.
export function KanbanBoard({
  cards,
  columns,
  hrefPrefix,
  onStatusChange,
}: {
  cards: KanbanCard[];
  columns: KanbanColumnDef[];
  hrefPrefix: string;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [localCards, setLocalCards] = useState(cards);
  const [, startTransition] = useTransition();

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId;
    setLocalCards((prev) =>
      prev.map((c) => (c.id === draggableId ? { ...c, status: newStatus } : c)),
    );
    startTransition(() => {
      onStatusChange(draggableId, newStatus);
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {columns.map((col) => {
          const colCards = localCards.filter((c) => c.status === col.value);
          return (
            <div key={col.value} className="min-w-0">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span
                  className={`h-2 w-2 rounded-full ${TONE_DOT[col.tone ?? "neutral"]}`}
                />
                <span className="text-sm font-semibold text-ink/80">
                  {col.label}
                </span>
                <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-xs text-ink/60">
                  {colCards.length}
                </span>
              </div>
              <Droppable droppableId={col.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[64px] space-y-2 rounded-xl p-1 transition ${
                      snapshot.isDraggingOver ? "bg-accent-soft/60" : ""
                    }`}
                  >
                    {colCards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <Link
                            href={`${hrefPrefix}/${card.id}`}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`card block border-l-4 p-3.5 transition ${TONE_BORDER[card.tone ?? "neutral"]} ${
                              dragSnapshot.isDragging
                                ? "shadow-lg ring-1 ring-accent/40"
                                : "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                            }`}
                          >
                            <p className="line-clamp-2 text-sm font-medium text-ink">
                              {card.title}
                            </p>
                            {card.subtitle && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <Avatar name={card.subtitle} size="sm" />
                                <p className="truncate text-xs text-ink/50">
                                  {card.subtitle}
                                </p>
                              </div>
                            )}
                            {card.meta && (
                              <p
                                className={`mt-2 text-xs ${
                                  card.metaTone === "danger"
                                    ? "font-medium text-rust"
                                    : card.metaTone === "warning"
                                      ? "text-gold"
                                      : "text-ink/55"
                                }`}
                              >
                                {card.meta}
                              </p>
                            )}
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colCards.length === 0 && (
                      <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-line px-2 py-6 text-center">
                        <Inbox className="h-4 w-4 text-ink/20" />
                        <p className="text-xs text-ink/30">Ingen her</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
