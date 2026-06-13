/* eslint-disable prettier/prettier */
import { Body, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { UserService } from '../user/user.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  registerService(payload: RegisterDto) {
    const user = this.userService.getUserByEmail(payload.email);
    return user;
  }
}
