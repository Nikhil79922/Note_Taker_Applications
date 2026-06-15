import { IsIn, IsOptional, IsString } from 'class-validator';
import { TODO_STATUS, type TodoStatus } from '../enums/todo-status.enum.js';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(TODO_STATUS)
  status?: TodoStatus;
}
