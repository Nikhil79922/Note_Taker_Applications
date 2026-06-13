import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NoteTakerModule } from './note-taker/note-taker.module';

@Module({
  imports: [AuthModule, NoteTakerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
