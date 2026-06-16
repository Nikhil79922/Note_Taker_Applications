import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './public.decorator.js';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  getHello(): string {
    return this.appService.getHello();
  }
}
