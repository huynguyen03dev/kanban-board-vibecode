'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/kanban';
import { Trash2, Edit3, Check, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    disabled: isEditing, // Disable dragging when editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : 'hover:shadow-md'
      } ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...attributes}
      {...(!isEditing ? listeners : {})}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveEdit}
                className="h-6 w-6 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium leading-tight flex-1">
                {task.title}
              </h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{task.description}</p>
        </CardContent>
      )}
    </Card>
  );
};
