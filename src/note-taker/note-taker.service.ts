/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './Dto/createNotes.dto.js';
import { RequestDto } from './Dto/request.dto.js';
import { PrismaService } from '../prisma.service.js';
import { CreateTodoDto } from './Dto/createTodo.dto.js';
import {
  GetNoteParamsDto,
  IdsPayloadDto,
  PaginationDto,
} from './Dto/getDetails.dto.js';
import { UpdateNoteDto } from './Dto/update-note.dto.js';
import { UpdateTodoDto } from './Dto/update-todo.dto.js';

@Injectable()
export class NoteTakerService {
  private readonly logger = new Logger(NoteTakerService.name);
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
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const skip = (page - 1) * limit;

    const note = await this.prisma.note.findFirst({
      where: {
        id: params.id,
        user_id: userDetails.sub,
      },
      select: {
        id: true,
        title: true,
        note_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const where = {
      note_id: params.id,

      ...(query.search && {
        OR: [
          {
            body: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
          {
            tag: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),

      ...(query.status && {
        status: query.status,
      }),

      ...(query.tag && {
        tag: {
          contains: query.tag,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [todos, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          body: true,
          tag: true,
          status: true,
          note_id: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),

      this.prisma.todo.count({
        where,
      }),
    ]);

    return {
      message:
        todos.length > 0 ? 'Successfully fetched all todos' : 'No todo found',
      data: {
        note,
        todos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
        filters: {
          search: query.search ?? null,
          status: query.status ?? null,
          tag: query.tag ?? null,
        },
      },
    };
  }

  async getNotes(query: PaginationDto, userDetails: RequestDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const skip = (page - 1) * limit;

    const where = {
      user_id: userDetails.sub,

      ...(query.search && {
        title: {
          contains: query.search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          user: {
            select: {
              name: true,
            },
          },
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.note.count({
        where,
      }),
    ]);

    return {
      message:
        notes.length > 0 ? 'Successfully fetched all notes' : 'No notes found',
      data: {
        items: notes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
        filters: {
          search: query.search ?? null,
        },
      },
    };
  }

  async updateNote(
    noteId: number,
    payload: UpdateNoteDto,
    userDetails: RequestDto,
  ) {
    const note = await this.prisma.note.findFirst({
      where: {
        id: noteId,
        user_id: userDetails.sub,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const updatedNote = await this.prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        ...(payload.title && {
          title: payload.title,
        }),

        ...(payload.note_date && {
          note_date: payload.note_date,
        }),
      },
      select: {
        id: true,
        title: true,
        note_date: true,
        updated_at: true,
      },
    });

    return {
      message: 'Note updated successfully',
      data: updatedNote,
    };
  }

  async updateTodo(
    todoId: number,
    payload: UpdateTodoDto,
    userDetails: RequestDto,
  ) {
    const todo = await this.prisma.todo.findFirst({
      where: {
        id: todoId,
        note: {
          user_id: userDetails.sub,
        },
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    const updatedTodo = await this.prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        ...(payload.body && {
          body: payload.body,
        }),

        ...(payload.tag !== undefined && {
          tag: payload.tag,
        }),

        ...(payload.status && {
          status: payload.status,
        }),
      },
      select: {
        id: true,
        body: true,
        tag: true,
        status: true,
        note_id: true,
        updated_at: true,
      },
    });

    return {
      message: 'Todo updated successfully',
      data: updatedTodo,
    };
  }

  async deleteTodos(payload: IdsPayloadDto, userDetails: RequestDto) {
    const result = await this.prisma.todo.deleteMany({
      where: {
        id: {
          in: payload.id,
        },
        note: {
          user_id: userDetails.sub,
        },
      },
    });
    this.logger.debug(`Delete todos result value ${JSON.stringify(result)}`);
    if (result.count) {
      return {
        message: `${result.count} todos deleted successfully`,
      };
    }
    return {
      message: `${result.count} todos found`,
    };
  }

  async deleteNotes(payload: IdsPayloadDto, userDetails: RequestDto) {
    const result = await this.prisma.note.deleteMany({
      where: {
        id: {
          in: payload.id,
        },
        user: {
          id: userDetails.sub,
        },
      },
    });
    this.logger.debug(`Delete Notes result value ${JSON.stringify(result)}`);
    if (result.count) {
      return {
        message: `${result.count} notes deleted successfully`,
      };
    }
    return {
      message: `${result.count} notes found`,
    };
  }
}
