"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Todo, ColumnId } from "@/lib/types/todo";
import { TodoCard } from "./todo-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onAddTodo: (columnId: ColumnId) => void;
}

export function KanbanColumn({
  id,
  title,
  todos,
  onEdit,
  onAddTodo,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-full sm:min-w-[280px] md:min-w-[300px] max-w-full sm:max-w-[350px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-nvidia-green uppercase tracking-wider">
            {title}
          </h2>
          <span className="bg-nvidia-gray-light text-gray-400 text-xs font-medium px-2 py-1 rounded-full">
            {todos.length}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddTodo(id)}
          className="h-8 w-8 p-0 hover:bg-nvidia-gray-light hover:text-nvidia-green"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 bg-nvidia-dark rounded-lg p-3 space-y-3 overflow-y-auto
          transition-all duration-200 min-h-[300px] sm:min-h-[400px]
          ${isOver ? "ring-2 ring-nvidia-green ring-opacity-50 bg-nvidia-gray" : ""}
        `}
      >
        <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {todos.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm text-center">
              Drop todos here or click + to add
            </div>
          ) : (
            todos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onEdit={onEdit} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
