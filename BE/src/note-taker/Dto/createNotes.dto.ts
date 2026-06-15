import { IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, {
    message: 'note_date must be a full UTC ISO datetime',
  })
  note_date?: string;
}
