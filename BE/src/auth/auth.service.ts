/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async registerService(payload: RegisterDto) {
    const saltRounds = 10;
    const user = await this.userService.getUserByEmail(payload.email);
    if (user) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);
    const newUser = await this.userService.createUser({
      ...payload,
      password: hashedPassword,
    });
    this.logger.log(`New User created with the User Id :: ${newUser.id} `);
    const jwtPayload = { sub: newUser.id, email: newUser.email };
    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
    };
  }

  async loginService(payload: LoginDto) {
    const user: any = await this.userService.getUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentails');
    }
    const compare = await bcrypt.compare(payload.password, user.password);
    this.logger.debug(`compare value ${compare}`);
    if (!compare) {
      this.logger.error('wrong password');
      throw new UnauthorizedException('Invalid credentails');
    }

    const jwtPayload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
    };
  }
}
