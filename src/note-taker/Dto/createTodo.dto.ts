import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TodoStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsEnum(TodoStatus)
  status!: TodoStatus;

  @Type(() => Number)
  @IsInt()
  note_id!: number;
}
