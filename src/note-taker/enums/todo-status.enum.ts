export const TODO_STATUS = ['NEW', 'IN_PROGRESS', 'DONE'] as const;

export type TodoStatus = (typeof TODO_STATUS)[number];
