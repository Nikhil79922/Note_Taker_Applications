/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateNoteDto } from './Dto/createNotes.dto.js';
import { NoteTakerService } from './note-taker.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { Request as ExpressRequest } from 'express';
import { RequestDto } from './Dto/request.dto.js';

@Controller('api/note')
export class NoteTakerController {
  constructor(private readonly noteService: NoteTakerService) {}

  @UseGuards(AuthGuard)
  @Post()
  createNote(@Body() payload: CreateNoteDto, @Request() req: ExpressRequest) {
    const userDetails = req['user'] as RequestDto;
    return this.noteService.createNote(payload, userDetails);
  }
}
