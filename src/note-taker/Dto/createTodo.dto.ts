import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TODO_STATUS, type TodoStatus } from '../enums/todo-status.enum.js';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsIn(TODO_STATUS)
  status!: TodoStatus;

  @Type(() => Number)
  @IsInt()
  note_id!: number;
}
