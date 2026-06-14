/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { CreateNoteDto } from './Dto/createNotes.dto.js';
import { NoteTakerService } from './note-taker.service.js';
import type { Request as ExpressRequest } from 'express';
import { RequestDto } from './Dto/request.dto.js';
import { CreateTodoDto } from './Dto/createTodo.dto.js';
import { GetNoteParamsDto, PaginationDto } from './Dto/getDetails.dto.js';

@Controller('api/note')
export class NoteTakerController {
  constructor(private readonly noteService: NoteTakerService) {}

  @Post('/createNote')
  createNote(@Body() payload: CreateNoteDto, @Request() req: ExpressRequest) {
    const userDetails = req['user'] as RequestDto;
    return this.noteService.createNote(payload, userDetails);
  }

  @Post('/createTodo')
  createTodo(@Body() payload: CreateTodoDto, @Request() req: ExpressRequest) {
    const userDetails = req['user'] as RequestDto;
    return this.noteService.createTodo(payload, userDetails);
  }

  @Get('/getAllTodos/:id')
  getTodos(
    @Param() params: GetNoteParamsDto,
    @Query() query: PaginationDto,
    @Request() req: ExpressRequest,
  ) {
    const userDetails = req['user'] as RequestDto;
    return this.noteService.getTodos(params, query, userDetails);
  }

  @Get('/getAllNotes')
  getNotes(@Query() query: PaginationDto, @Request() req: ExpressRequest) {
    const userDetails = req['user'] as RequestDto;
    return this.noteService.getNotes(query, userDetails);
  }
}
