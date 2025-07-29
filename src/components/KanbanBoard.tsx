'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { Task } from '@/types/kanban';

export const KanbanBoard = () => {
  const { board, loading, error, addTask, updateTask, deleteTask, moveTask, refetch } = useKanbanBoard();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = board.columns
      .flatMap(col => col.tasks)
      .find(task => task.id === activeId);

    if (!activeTask) return;

    // Find the source column
    const sourceColumn = board.columns.find(col =>
      col.tasks.some(task => task.id === activeId)
    );

    // Find the target column
    const targetColumn = board.columns.find(col => col.id === overId);

    if (!sourceColumn || !targetColumn) return;

    // If dropping in the same column, do nothing for now
    // (we could implement reordering within column here)
    if (sourceColumn.id === targetColumn.id) return;

    // Move task to new column
    moveTask(activeId, sourceColumn.id, targetColumn.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Kanban Board
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Organize your tasks with drag and drop functionality
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Kanban Board
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Organize your tasks with drag and drop functionality
          </p>
          {error && (
            <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button
                onClick={refetch}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 overflow-x-auto pb-6">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
