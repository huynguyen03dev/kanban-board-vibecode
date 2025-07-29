import { Task as PrismaTask, TaskStatus } from '@prisma/client';

export type Task = PrismaTask;

export type TaskStatusType = TaskStatus;

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

export interface KanbanBoard {
  columns: Column[];
}

export type DragEndEvent = {
  active: {
    id: string;
    data: {
      current?: {
        type: string;
        task?: Task;
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        type: string;
        accepts?: string[];
      };
    };
  } | null;
};
