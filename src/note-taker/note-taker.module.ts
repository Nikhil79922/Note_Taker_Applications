/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { NoteTakerController } from './note-taker.controller.js';
import { NoteTakerService } from './note-taker.service.js';

@Module({
  controllers: [NoteTakerController],
  providers: [NoteTakerService],
})
export class NoteTakerModule {}
