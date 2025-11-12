"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "@/lib/types/todo";
import { Calendar, GripVertical, Tag } from "lucide-react";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

export function TodoCard({ todo, onEdit }: TodoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = () => {
    switch (todo.status) {
      case "green":
        return "border-l-status-green";
      case "yellow":
        return "border-l-status-yellow";
      case "red":
        return "border-l-status-red";
      default:
        return "border-l-nvidia-green";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-nvidia-gray border-l-4 ${getStatusColor()}
        rounded-lg p-4 cursor-pointer
        hover:bg-nvidia-gray-light transition-all duration-200
        ${isDragging ? "opacity-50 shadow-2xl" : "shadow-md hover:shadow-lg"}
      `}
      onClick={() => onEdit(todo)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-nvidia-green" />
      </div>

      {/* Title */}
      <h3 className="text-white font-medium mb-2 pr-6 line-clamp-2">
        {todo.title}
      </h3>

      {/* Description */}
      {todo.description && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {todo.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {/* Due Date */}
          {todo.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(todo.due_date)}</span>
            </div>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{todo.tags.length}</span>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div
          className={`w-2 h-2 rounded-full ${
            todo.status === "green"
              ? "bg-status-green"
              : todo.status === "yellow"
              ? "bg-status-yellow"
              : "bg-status-red"
          }`}
        />
      </div>
    </div>
  );
}
