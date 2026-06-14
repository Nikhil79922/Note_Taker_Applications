import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './Dto/createNotes.dto.js';
import { RequestDto } from './Dto/request.dto.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class NoteTakerService {
  constructor(private readonly prisma: PrismaService) {}

  async createNote(payload: CreateNoteDto, userDetails: RequestDto) {
    await this.prisma.note.create({
      data: {
        title: payload.title,
        note_date: payload.note_date ?? new Date(),
        user_id: userDetails.sub,
      },
    });
    return {
      message: `Note created SuccessFully`,
    };
  }
}
