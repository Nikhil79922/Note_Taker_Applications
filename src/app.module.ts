import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { NoteTakerModule } from './note-taker/note-taker.module.js';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, NoteTakerModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
