'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { AddColumnButton } from './AddColumnButton';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import { Task, Column } from '@/types/kanban';
import { ThemeToggle } from './theme-toggle';

export const KanbanBoard = () => {
  const {
    board,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    refetch
  } = useKanbanBoard();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);



  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === 'task') {
      const task = active.data.current?.task;
      if (task) {
        setActiveTask(task);
      }
    } else if (active.data.current?.type === 'column') {
      const column = active.data.current?.column;
      if (column) {
        setActiveColumn(column);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
      if (activeId !== overId) {
        const oldIndex = board.columns.findIndex(col => col.id === activeId);
        const newIndex = board.columns.findIndex(col => col.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newColumnOrder = [...board.columns];
          const [movedColumn] = newColumnOrder.splice(oldIndex, 1);
          newColumnOrder.splice(newIndex, 0, movedColumn);

          reorderColumns(newColumnOrder.map(col => col.id));
        }
      }
      return;
    }

    // Handle task movement (existing logic)
    if (active.data.current?.type === 'task') {
      // Find the task being dragged
      const activeTask = board.columns
        .flatMap(col => col.tasks)
        .find(task => task.id === activeId);

      if (!activeTask) return;

      // Find the source column
      const sourceColumn = board.columns.find(col =>
        col.tasks.some(task => task.id === activeId)
      );

      if (!sourceColumn) return;

      // Determine the target column
      let targetColumn = null;

      // Check if we're dropping on a column directly
      if (over.data.current?.type === 'column') {
        targetColumn = board.columns.find(col => col.id === overId);
      } else {
        // If dropping on a task, find which column that task belongs to
        const targetTask = board.columns
          .flatMap(col => col.tasks)
          .find(task => task.id === overId);

        if (targetTask) {
          targetColumn = board.columns.find(col =>
            col.tasks.some(task => task.id === targetTask.id)
          );
        }
      }

      if (!targetColumn) return;

      // If dropping in the same column, do nothing for now
      // (we could implement reordering within column here)
      if (sourceColumn.id === targetColumn.id) return;

      // Move task to new column
      moveTask(activeId, sourceColumn.id, targetColumn.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Kanban Board
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Organize your tasks with drag and drop functionality
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Kanban Board
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Organize your tasks with drag and drop functionality
            </p>
            {error && (
              <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
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
          <ThemeToggle />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-x-auto pb-6 min-h-[400px]">
            <SortableContext
              items={board.columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {board.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onUpdateColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                  isDragging={activeColumn?.id === column.id}
                />
              ))}
            </SortableContext>

            <AddColumnButton onAddColumn={addColumn} />
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  onUpdate={() => {}}
                  onDelete={() => Promise.resolve()}
                />
              </div>
            ) : activeColumn ? (
              <div className="rotate-1 scale-105">
                <KanbanColumn
                  column={activeColumn}
                  onAddTask={() => Promise.resolve()}
                  onUpdateTask={() => Promise.resolve()}
                  onDeleteTask={() => Promise.resolve()}
                  onUpdateColumn={() => Promise.resolve()}
                  onDeleteColumn={() => Promise.resolve()}
                  isDragging={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
