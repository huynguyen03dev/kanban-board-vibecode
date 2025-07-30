'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit3, Trash2, GripVertical, Check, X } from 'lucide-react';
import { Column } from '@/types/kanban';
import { toast } from 'sonner';

interface ColumnHeaderProps {
  column: Column;
  onUpdateColumn: (columnId: string, updates: { name?: string; color?: string }) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
  isDragging?: boolean;
}

const COLUMN_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Gray', value: '#6B7280' },
];

export const ColumnHeader = ({ 
  column, 
  onUpdateColumn, 
  onDeleteColumn, 
  isDragging = false 
}: ColumnHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const [editColor, setEditColor] = useState(column.color);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEdit = async () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      toast.error('Column name cannot be empty');
      return;
    }

    if (trimmedName.length > 50) {
      toast.error('Column name must be 50 characters or less');
      return;
    }

    if (trimmedName.length < 2) {
      toast.error('Column name must be at least 2 characters');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateColumn(column.id, {
        name: trimmedName,
        color: editColor,
      });
      setIsEditing(false);
      toast.success('Column updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update column';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(column.name);
    setEditColor(column.color);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (column.tasks.length > 0) {
      toast.error('Cannot delete column with tasks. Please move or delete all tasks first.');
      setShowDeleteDialog(false);
      return;
    }

    setIsLoading(true);
    try {
      await onDeleteColumn(column.id);
      setShowDeleteDialog(false);
      toast.success('Column deleted successfully');
    } catch (error) {
      toast.error('Failed to delete column');
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderColor = (color: string) => {
    // Convert hex to RGB and create a lighter background
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
      color: color,
    };
  };

  if (isEditing) {
    return (
      <div 
        className="rounded-t-lg p-3 border-b"
        style={getHeaderColor(editColor)}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm font-semibold"
              disabled={isLoading}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isLoading || !editName.trim()}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-8 gap-1">
            {COLUMN_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setEditColor(color.value)}
                className={`w-6 h-6 rounded border transition-all ${
                  editColor === color.value
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                disabled={isLoading}
              >
                {editColor === color.value && (
                  <Check className="h-3 w-3 text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`rounded-t-lg p-3 border-b transition-all ${
          isDragging ? 'opacity-50' : ''
        }`}
        style={getHeaderColor(column.color)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 opacity-50 cursor-grab" />
            <h3 className="text-sm font-semibold" style={{ color: column.color }}>
              {column.name}
            </h3>
            <span className="text-xs opacity-70">
              {column.tasks.length}
            </span>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the "{column.name}" column?
              {column.tasks.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  This column contains {column.tasks.length} task(s). Please move or delete all tasks before deleting the column.
                </span>
              )}
            </p>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDelete}
                disabled={isLoading || column.tasks.length > 0}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? 'Deleting...' : 'Delete Column'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
