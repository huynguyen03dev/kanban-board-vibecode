'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, Column, KanbanBoardData } from '@/types/kanban';
import { toast } from 'sonner';

export const useKanbanBoard = () => {
  const [board, setBoard] = useState<KanbanBoardData>({ columns: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all columns with their tasks from the database
  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/columns');
      if (!response.ok) {
        throw new Error('Failed to fetch board data');
      }
      const columns: Column[] = await response.json();

      setBoard({ columns });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to load board', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load board on component mount
  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const addTask = useCallback(async (columnId: string, title: string, description?: string) => {
    try {
      setError(null);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, columnId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask: Task = await response.json();

      setBoard(prev => ({
        columns: prev.columns.map(column =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        ),
      }));

      toast.success('Task created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setError(errorMessage);
      toast.error('Failed to create task', {
        description: errorMessage,
      });
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask: Task = await response.json();

      setBoard(prev => ({
        columns: prev.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
      }));

      toast.success('Task updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      toast.error('Failed to update task', {
        description: errorMessage,
      });
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setBoard(prev => ({
        columns: prev.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId),
        })),
      }));

      toast.success('Task deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      toast.error('Failed to delete task', {
        description: errorMessage,
      });
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, fromColumnId: string, toColumnId: string) => {
    try {
      setError(null);

      // Optimistically update the UI
      setBoard(prev => {
        const fromColumn = prev.columns.find(col => col.id === fromColumnId);
        const toColumn = prev.columns.find(col => col.id === toColumnId);
        const task = fromColumn?.tasks.find(t => t.id === taskId);

        if (!task || !fromColumn || !toColumn) return prev;

        const updatedTask = { ...task, columnId: toColumnId };

        return {
          columns: prev.columns.map(column => {
            if (column.id === fromColumnId) {
              return {
                ...column,
                tasks: column.tasks.filter(t => t.id !== taskId),
              };
            }
            if (column.id === toColumnId) {
              return {
                ...column,
                tasks: [...column.tasks, updatedTask],
              };
            }
            return column;
          }),
        };
      });

      // Update in database using the move endpoint
      const response = await fetch('/api/tasks/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          sourceColumnId: fromColumnId,
          targetColumnId: toColumnId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move task');
      }

      toast.success('Task moved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move task';
      setError(errorMessage);
      toast.error('Failed to move task', {
        description: errorMessage,
      });
      // Refresh data to ensure consistency
      fetchBoard();
    }
  }, [fetchBoard]);

  // Column management functions
  const addColumn = useCallback(async (name: string, color: string) => {
    try {
      setError(null);
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to create column');
      }

      const newColumn: Column = await response.json();

      setBoard(prev => ({
        columns: [...prev.columns, newColumn],
      }));

      toast.success('Column created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add column';
      setError(errorMessage);
      toast.error('Failed to create column', {
        description: errorMessage,
      });
      throw err;
    }
  }, []);

  const updateColumn = useCallback(async (columnId: string, updates: { name?: string; color?: string }) => {
    try {
      setError(null);
      const response = await fetch(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update column');
      }

      const updatedColumn: Column = await response.json();

      setBoard(prev => ({
        columns: prev.columns.map(column =>
          column.id === columnId ? updatedColumn : column
        ),
      }));

      toast.success('Column updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update column';
      setError(errorMessage);
      toast.error('Failed to update column', {
        description: errorMessage,
      });
      throw err;
    }
  }, []);

  const deleteColumn = useCallback(async (columnId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/columns/${columnId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete column');
      }

      setBoard(prev => ({
        columns: prev.columns.filter(column => column.id !== columnId),
      }));

      toast.success('Column deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete column';
      setError(errorMessage);
      toast.error('Failed to delete column', {
        description: errorMessage,
      });
      throw err;
    }
  }, []);

  const reorderColumns = useCallback(async (columnIds: string[]) => {
    try {
      setError(null);

      // Optimistically update the UI
      setBoard(prev => {
        const reorderedColumns = columnIds.map(id =>
          prev.columns.find(col => col.id === id)!
        ).filter(Boolean);

        return { columns: reorderedColumns };
      });

      const response = await fetch('/api/columns/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ columnIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder columns');
      }

      const updatedColumns: Column[] = await response.json();
      setBoard({ columns: updatedColumns });

      toast.success('Columns reordered successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder columns';
      setError(errorMessage);
      toast.error('Failed to reorder columns', {
        description: errorMessage,
      });
      // Refresh data to ensure consistency
      fetchBoard();
    }
  }, [fetchBoard]);

  return {
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
    refetch: fetchBoard,
  };
};
