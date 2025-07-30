'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from './TaskCard';
import { ColumnHeader } from './ColumnHeader';
import { Column, Task } from '@/types/kanban';
import { Plus, X } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  onAddTask: (columnId: string, title: string, description?: string) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateColumn: (columnId: string, updates: { name?: string; color?: string }) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
  isDragging?: boolean;
}

export const KanbanColumn = ({
  column,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
  isDragging = false,
}: KanbanColumnProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Make the column sortable for drag and drop reordering
  const {
    attributes: sortableAttributes,
    listeners: sortableListeners,
    setNodeRef: setSortableNodeRef,
    transform: sortableTransform,
    transition: sortableTransition,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  // Make the column droppable for tasks
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      accepts: ['task'],
    },
  });

  // Combine the refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const sortableStyle = {
    transform: CSS.Transform.toString(sortableTransform),
    transition: sortableTransition,
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        await onAddTask(column.id, newTaskTitle.trim());
        setNewTaskTitle('');
        setIsAddingTask(false);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const getColumnColor = (color: string) => {
    // Convert hex to RGB and create a lighter background
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return {
      borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.05)`,
    };
  };

  const columnStyle = getColumnColor(column.color);

  return (
    <Card
      ref={setNodeRef}
      className={`w-full lg:w-80 min-w-[280px] h-fit transition-colors duration-200 border-2 group ${
        isDragging ? 'opacity-50 rotate-1 scale-105' : ''
      }`}
      style={{ ...columnStyle, ...sortableStyle }}
      {...sortableAttributes}
      {...sortableListeners}
    >
      <ColumnHeader
        column={column}
        onUpdateColumn={onUpdateColumn}
        onDeleteColumn={onDeleteColumn}
        isDragging={isDragging}
      />
      <CardContent className="p-3">
        <div
          ref={setNodeRef}
          className={`min-h-[150px] sm:min-h-[200px] transition-colors duration-200 rounded-lg p-3 ${
            isOver ? 'bg-primary/10 border-2 border-dashed border-primary' : 'border-2 border-transparent'
          }`}
        >
          {/* Tasks container */}
          <div className="space-y-3">
            <SortableContext
              items={column.tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {column.tasks.map((task) => (
                <div key={task.id} className="group">
                  <TaskCard
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                </div>
              ))}
            </SortableContext>
          </div>

          {/* Drop zone indicator when dragging over */}
          {isOver && column.tasks.length > 0 && (
            <div className="mt-3 h-8 border-2 border-dashed border-primary/50 rounded-md bg-primary/5 flex items-center justify-center">
              <span className="text-xs text-primary/70 font-medium">Drop here</span>
            </div>
          )}

          {/* Empty state message */}
          {column.tasks.length === 0 && !isOver && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No tasks yet
            </div>
          )}

          {isAddingTask ? (
            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter task title..."
                    className="text-sm"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskTitle('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="ghost"
              className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
