import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './Dto/createNotes.dto.js';
import { RequestDto } from './Dto/request.dto.js';
import { PrismaService } from '../prisma.service.js';
import { CreateTodoDto } from './Dto/createTodo.dto.js';
import { GetNoteParamsDto, PaginationDto } from './Dto/getDetails.dto.js';

@Injectable()
export class NoteTakerService {
  constructor(private readonly prisma: PrismaService) {}

  async createNote(payload: CreateNoteDto, userDetails: RequestDto) {
    const newNote = await this.prisma.note.create({
      data: {
        title: payload.title,
        note_date: payload.note_date ?? new Date(),
        user_id: userDetails.sub,
      },
      select: {
        id: true,
        title: true,
        note_date: true,
      },
    });
    return {
      message: `Note created SuccessFully`,
      data: newNote,
    };
  }

  async createTodo(payload: CreateTodoDto, userDetails: RequestDto) {
    const note = await this.prisma.note.findFirst({
      where: {
        id: payload.note_id,
        user_id: userDetails.sub,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const newTodo = await this.prisma.todo.create({
      data: {
        body: payload.body,
        tag: payload.tag,
        status: payload.status,
        note_id: payload.note_id,
      },
      select: {
        id: true,
        body: true,
        tag: true,
        status: true,
        note_id: true,
        created_at: true,
      },
    });

    return {
      message: `Todo created SuccessFully`,
      data: newTodo,
    };
  }

  async getTodos(
    params: GetNoteParamsDto,
    query: PaginationDto,
    userDetails: RequestDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    const Todos = await this.prisma.todo.findMany({
      where: {
        note_id: params.id,
        note: {
          user_id: userDetails.sub,
        },
      },
      skip,
      take: query.limit,
      select: {
        id: true,
        body: true,
        tag: true,
        status: true,
        note_id: true,
        created_at: true,
      },
    });

    if (Todos.length == 0) {
      return {
        message: `No todo found`,
      };
    }
    return {
      message: `SuccessFully fetched all todo`,
      data: Todos,
    };
  }

  async getNotes(query: PaginationDto, userDetails: RequestDto) {
    const skip = (query.page - 1) * query.limit;
    const notes = await this.prisma.note.findMany({
      where: {
        user_id: userDetails.sub,
      },
      skip,
      take: query.limit,
      select: {
        id: true,
        title: true,
        user: {
          select: { name: true },
        },
        created_at: true,
      },
    });

    if (notes.length == 0) {
      return {
        message: `No notes found`,
      };
    }
    return {
      message: `SuccessFully fetched all notes`,
      data: notes,
    };
  }
}
