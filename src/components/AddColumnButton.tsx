'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddColumnButtonProps {
  onAddColumn: (name: string, color: string) => Promise<void>;
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

export const AddColumnButton = ({ onAddColumn }: AddColumnButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = columnName.trim();

    if (!trimmedName) {
      toast.error('Column name is required');
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
      await onAddColumn(trimmedName, selectedColor);
      setColumnName('');
      setSelectedColor('#3B82F6');
      setIsOpen(false);
      toast.success('Column created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create column';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setColumnName('');
    setSelectedColor('#3B82F6');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="w-full lg:w-80 min-w-[280px] h-fit border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-muted-foreground font-medium">Add Column</span>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="columnName" className="block text-sm font-medium mb-2">
              Column Name
            </label>
            <Input
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name..."
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Column Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLUMN_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-foreground scale-110'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  disabled={isLoading}
                >
                  {selectedColor === color.value && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !columnName.trim()}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Column'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
