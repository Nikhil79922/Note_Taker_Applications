/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth') // Route now /auth/register
export class AuthController {
  constructor(private readonly authService :AuthService){
  }
  @Post('register')
  register(@Body() registerDto: RegisterDto ) {

const response = this.authService.registerService(registerDto);
return response;
  }
}
