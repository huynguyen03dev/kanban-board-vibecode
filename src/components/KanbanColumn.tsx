'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from './TaskCard';
import { Column, Task } from '@/types/kanban';
import { Plus, X } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  onAddTask: (columnId: string, title: string, description?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn = ({
  column,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: KanbanColumnProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      accepts: ['task'],
    },
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
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

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'border-blue-200 bg-blue-50/50';
      case 'IN_PROGRESS':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'DONE':
        return 'border-green-200 bg-green-50/50';
      default:
        return 'border-gray-200 bg-gray-50/50';
    }
  };

  const getHeaderColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'text-blue-700 bg-blue-100';
      case 'IN_PROGRESS':
        return 'text-yellow-700 bg-yellow-100';
      case 'DONE':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <Card className={`w-full sm:w-80 h-fit ${getColumnColor(column.status)} transition-colors duration-200`}>
      <CardHeader className={`rounded-t-lg ${getHeaderColor(column.status)}`}>
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span>{column.title}</span>
          <span className="text-xs font-normal opacity-70">
            {column.tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div
          ref={setNodeRef}
          className={`min-h-[150px] sm:min-h-[200px] space-y-3 transition-colors duration-200 rounded-lg p-2 ${
            isOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
          }`}
        >
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
              className="w-full border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors"
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
