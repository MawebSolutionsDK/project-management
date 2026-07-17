"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

export type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  metaTone?: "danger" | "warning" | null;
  status: string;
};

export type KanbanColumnDef = { value: string; label: string };

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
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => {
          const colCards = localCards.filter((c) => c.status === col.value);
          return (
            <div key={col.value} className="w-72 shrink-0">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="text-sm font-semibold text-ink/80">
                  {col.label}
                </span>
                <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-xs text-ink/45">
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
                            className={`card block p-3.5 transition ${
                              dragSnapshot.isDragging
                                ? "shadow-lg ring-1 ring-accent/40"
                                : "hover:border-accent/40"
                            }`}
                          >
                            <p className="text-sm font-medium text-ink">
                              {card.title}
                            </p>
                            {card.subtitle && (
                              <p className="mt-1 truncate text-xs text-ink/50">
                                {card.subtitle}
                              </p>
                            )}
                            {card.meta && (
                              <p
                                className={`mt-2 text-xs ${
                                  card.metaTone === "danger"
                                    ? "font-medium text-rust"
                                    : card.metaTone === "warning"
                                      ? "text-gold"
                                      : "text-ink/40"
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
                      <p className="px-2 py-3 text-center text-xs text-ink/30">
                        Ingen her
                      </p>
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
