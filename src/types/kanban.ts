import { Task as PrismaTask, Column as PrismaColumn } from '@prisma/client';

export type Task = PrismaTask;
export type Column = PrismaColumn & { tasks: Task[] };

export interface KanbanBoardData {
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
