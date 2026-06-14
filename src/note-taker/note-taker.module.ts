/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { NoteTakerController } from './note-taker.controller.js';
import { NoteTakerService } from './note-taker.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaService } from '../prisma.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthModule],
  controllers: [NoteTakerController],
  providers: [
    NoteTakerService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class NoteTakerModule {}
