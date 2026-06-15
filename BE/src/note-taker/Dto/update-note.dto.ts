// update-note.dto.ts

import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  note_date?: Date;
}
