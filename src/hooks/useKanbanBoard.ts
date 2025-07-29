'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, Column, KanbanBoard } from '@/types/kanban';
import { TaskStatus } from '@prisma/client';
import { toast } from 'sonner';

const initialColumns: Column[] = [
  {
    id: 'TODO',
    title: 'To Do',
    status: TaskStatus.TODO,
    tasks: [],
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    status: TaskStatus.IN_PROGRESS,
    tasks: [],
  },
  {
    id: 'DONE',
    title: 'Done',
    status: TaskStatus.DONE,
    tasks: [],
  },
];

export const useKanbanBoard = () => {
  const [board, setBoard] = useState<KanbanBoard>({ columns: initialColumns });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tasks from the database
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasks: Task[] = await response.json();

      // Organize tasks by status into columns
      const updatedColumns = initialColumns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.status === column.status),
      }));

      setBoard({ columns: updatedColumns });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to load tasks', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (columnId: string, title: string, description?: string) => {
    try {
      setError(null);
      const status = columnId as TaskStatus;
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, status }),
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
      const newStatus = toColumnId as TaskStatus;

      // Optimistically update the UI
      setBoard(prev => {
        const fromColumn = prev.columns.find(col => col.id === fromColumnId);
        const toColumn = prev.columns.find(col => col.id === toColumnId);
        const task = fromColumn?.tasks.find(t => t.id === taskId);

        if (!task || !fromColumn || !toColumn) return prev;

        const updatedTask = { ...task, status: newStatus };

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

      // Update in database
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to move task');
        // In a real app, you might want to revert the optimistic update here
      }

      toast.success('Task moved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move task';
      setError(errorMessage);
      toast.error('Failed to move task', {
        description: errorMessage,
      });
      // Refresh data to ensure consistency
      fetchTasks();
    }
  }, [fetchTasks]);

  return {
    board,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch: fetchTasks,
  };
};
